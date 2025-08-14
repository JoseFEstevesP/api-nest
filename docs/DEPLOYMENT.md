# Guía de Despliegue

## Despliegue en Producción

### Preparación del Entorno

#### 1. Variables de Entorno de Producción

```bash
# .env.production
NODE_ENV=production
PORT=3000

# JWT Secrets (generar con openssl rand -base64 32)
JWT_SECRET=your-super-secure-jwt-secret-here
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-here

# Base de datos
DATABASE_DIALECT=postgres
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
POSTGRES_USER=your-db-user
POSTGRES_PASSWORD=your-secure-db-password
POSTGRES_DB=your-production-db

# Redis
REDIS_PORT=6379
REDIS_URL=redis://your-redis-host:6379

# Email
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-email-app-password

# CORS
CORS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_LIMIT=100
```

#### 2. Build de Producción

```bash
# Instalar dependencias
pnpm install --prod

# Compilar aplicación
pnpm run build

# Ejecutar migraciones
pnpm run migrate
```

## Docker Deployment

### Dockerfile Optimizado

```dockerfile
FROM node:24-alpine AS builder

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM node:24-alpine AS production

WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/migrations ./src/migrations
COPY .sequelizerc ./

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

### Docker Compose para Producción

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - '3000:3000'
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    depends_on:
      - db
      - redis
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    restart: unless-stopped
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Configuración de Nginx

### nginx.conf

```nginx
events {
    worker_connections 1024;
}

http {
    upstream api {
        server app:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        location / {
            limit_req zone=api burst=20 nodelay;

            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # Timeouts
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }

        location /uploads/ {
            alias /app/uploads/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

## Monitoreo y Logging

### Health Check Endpoint

```typescript
@Controller('health')
export class HealthController {
	constructor(
		private readonly sequelize: Sequelize,
		@Inject(CACHE_MANAGER) private cacheManager: Cache,
	) {}

	@Get()
	async check() {
		const checks = await Promise.allSettled([
			this.checkDatabase(),
			this.checkRedis(),
			this.checkMemory(),
		]);

		const status = checks.every(check => check.status === 'fulfilled')
			? 'healthy'
			: 'unhealthy';

		return {
			status,
			timestamp: new Date().toISOString(),
			checks: {
				database: checks[0].status === 'fulfilled' ? 'up' : 'down',
				redis: checks[1].status === 'fulfilled' ? 'up' : 'down',
				memory: checks[2].status === 'fulfilled' ? 'up' : 'down',
			},
		};
	}

	private async checkDatabase() {
		await this.sequelize.authenticate();
	}

	private async checkRedis() {
		await this.cacheManager.set('health-check', 'ok', 1);
	}

	private async checkMemory() {
		const usage = process.memoryUsage();
		if (usage.heapUsed > 500 * 1024 * 1024) {
			// 500MB
			throw new Error('High memory usage');
		}
	}
}
```

### Logging en Producción

```typescript
// logger.config.ts
export const loggerConfig = {
	level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.json(),
	),
	transports: [
		new winston.transports.Console({
			format: winston.format.simple(),
		}),
		new DailyRotateFile({
			filename: 'logs/application-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			maxSize: '20m',
			maxFiles: '14d',
		}),
		new DailyRotateFile({
			filename: 'logs/error-%DATE%.log',
			datePattern: 'YYYY-MM-DD',
			level: 'error',
			maxSize: '20m',
			maxFiles: '30d',
		}),
	],
};
```

## Backup y Recuperación

### Script de Backup Automático

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="your-production-db"

# Backup de base de datos
pg_dump -h db -U postgres $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos subidos
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz /app/uploads/

# Limpiar backups antiguos (mantener 7 días)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completado: $DATE"
```

### Cron Job para Backups

```bash
# Agregar al crontab
0 2 * * * /path/to/backup.sh >> /var/log/backup.log 2>&1
```

## SSL/TLS Configuration

### Obtener Certificado SSL (Let's Encrypt)

```bash
# Instalar certbot
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renovación
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Optimizaciones de Performance

### PM2 para Node.js

```bash
# Instalar PM2
npm install -g pm2

# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'api-nest',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_file: 'logs/pm2-combined.log',
    time: true
  }]
};

# Iniciar con PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Database Optimizations

```sql
-- Índices para mejorar performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_audits_created_at ON audits(created_at);
CREATE INDEX idx_audits_user_id ON audits(user_id);

-- Configuraciones de PostgreSQL
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

## Seguridad en Producción

### Firewall Configuration

```bash
# UFW (Ubuntu)
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fail2Ban para SSH

```bash
# Instalar fail2ban
sudo apt install fail2ban

# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
```

## Monitoreo con Prometheus

### docker-compose.monitoring.yml

```yaml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

## Troubleshooting

### Logs Comunes

```bash
# Ver logs de la aplicación
docker-compose logs -f app

# Ver logs de base de datos
docker-compose logs -f db

# Ver logs de nginx
docker-compose logs -f nginx

# Monitorear recursos
docker stats
```

### Comandos de Diagnóstico

```bash
# Verificar conectividad de base de datos
docker-compose exec app node -e "
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_URL);
sequelize.authenticate().then(() => console.log('DB OK')).catch(console.error);
"

# Verificar Redis
docker-compose exec redis redis-cli ping

# Verificar espacio en disco
df -h

# Verificar memoria
free -h
```
