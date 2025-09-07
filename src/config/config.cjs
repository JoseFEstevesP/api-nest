require('dotenv').config();

// Extraer las variables de entorno para evitar llamadas repetidas a process.env
const {
	DATABASE_DIALECT = 'postgres',
	DATABASE_HOST,
	DATABASE_PORT,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_DB,
} = process.env;

// Configuración base para todos los entornos
const baseConfig = {
	dialect: DATABASE_DIALECT,
	host: DATABASE_HOST,
	port: DATABASE_PORT,
	username: POSTGRES_USER,
	password: POSTGRES_PASSWORD,
	database: POSTGRES_DB,
};

module.exports = {
	development: { ...baseConfig },
	test: { ...baseConfig },
	production: { ...baseConfig },
};
