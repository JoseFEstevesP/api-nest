require('dotenv').config();

const {
	NODE_ENV,
	DATABASE_DIALECT = 'postgres',
	DATABASE_HOST,
	DATABASE_PORT,
	POSTGRES_USER,
	POSTGRES_PASSWORD,
	POSTGRES_DB,
} = process.env;

const isDevelopment = NODE_ENV === 'development';

// Configuración base para todos los entornos
const baseConfig = {
	dialect: DATABASE_DIALECT,
	host: isDevelopment ? 'db' : DATABASE_HOST,
	port: isDevelopment ? 5432 : parseInt(DATABASE_PORT, 10),
	username: POSTGRES_USER,
	password: POSTGRES_PASSWORD,
	database: POSTGRES_DB,
};

module.exports = {
	development: { ...baseConfig },
	test: { ...baseConfig },
	production: { ...baseConfig },
};
