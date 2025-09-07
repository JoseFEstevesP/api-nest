import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { TransformInterceptor } from './interceptors/transform.interceptor';
import {
	BadRequestException,
	INestApplication,
	ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './config/env.config';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';
import { objectError } from './functions/objectError';
import { globalMsg } from './globalMsg';
import { LoggerService } from './services/logger.service';

function setupSwagger(app: INestApplication) {
	const config = new DocumentBuilder()
		.setTitle(globalMsg.swagger.title)
		.setDescription(globalMsg.swagger.description)
		.setVersion(globalMsg.swagger.version)
		.addServer('http://localhost:3000/api', 'Servidor Local')
		.addServer('https://tu-dominio.com/api', 'Servidor de Producción')
		.addCookieAuth('refreshToken', {
			type: 'apiKey',
			in: 'cookie',
			name: 'refreshToken',
		})
		.addBearerAuth()
		.addTag(
			globalMsg.swagger.tags.user.name,
			globalMsg.swagger.tags.user.description,
		)
		.addTag(
			globalMsg.swagger.tags.rol.name,
			globalMsg.swagger.tags.rol.description,
		)
		.addTag(
			globalMsg.swagger.tags.audit.name,
			globalMsg.swagger.tags.audit.description,
		)
		.addTag(
			globalMsg.swagger.tags.auth.name,
			globalMsg.swagger.tags.auth.description,
		)
		.build();

	const document = SwaggerModule.createDocument(app, config);

	// Generación de documentación si se especifica el flag
	if (process.argv.includes('--generate-docs')) {
		const fs = require('fs');
		const path = require('path');

		const docsDir = path.join(process.cwd(), 'docs', 'swagger');
		if (!fs.existsSync(docsDir)) {
			fs.mkdirSync(docsDir, { recursive: true });
		}

		fs.writeFileSync(
			path.join(docsDir, 'swagger-spec.json'),
			JSON.stringify(document, null, 2),
			'utf8',
		);

		process.exit(0);
	}

	SwaggerModule.setup('doc', app, document, {
		swaggerOptions: {
			persistAuthorization: true,
		},
	});
}

async function bootstrap() {
	const logger = new LoggerService();
	const app = await NestFactory.create(AppModule, {
		logger,
	});

	app.use(helmet());

	const httpAdapterHost = app.get(HttpAdapterHost);
	app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost, logger));

	app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

	const expressApp = app.getHttpAdapter().getInstance();
	expressApp.set('trust proxy', true);

	const configService = app.get(ConfigService<EnvironmentVariables>);

	app.enableCors({
		origin: configService.get<string[]>('CORS'),
		credentials: true,
		methods: 'GET,PATCH,POST,DELETE',
	});

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
			exceptionFactory: errors => {
				const result = errors.map(error => {
					return objectError({
						name: error.property,
						msg: error.constraints[Object.keys(error.constraints)[0]],
					});
				});

				return new BadRequestException(Object.assign({}, ...result));
			},
			stopAtFirstError: true,
		}),
	);

	app.setGlobalPrefix('api');

	app.use(cookieParser());

	setupSwagger(app);

	const port = configService.get<number>('PORT');
	await app.listen(port, '0.0.0.0');
}

bootstrap();
