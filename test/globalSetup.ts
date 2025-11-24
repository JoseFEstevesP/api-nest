import { startPostgreSqlTestContainer, stopPostgreSqlTestContainer, getTestDatabaseConfig } from './testcontainers-config';

export default async function globalSetup() {
  console.log('Starting TestContainers setup...');

  // Start the PostgreSQL container before all tests
  const container = await startPostgreSqlTestContainer();

  // Store container info for use in tests
  global.__TEST_POSTGRES_CONTAINER__ = container;
  global.__TEST_DATABASE_CONFIG__ = getTestDatabaseConfig();

  // Set environment variables for the test database
  process.env.DATABASE_DIALECT = 'postgres';
  process.env.DATABASE_HOST = container.getHost();
  process.env.DATABASE_PORT = container.getFirstMappedPort().toString();
  process.env.POSTGRES_USER = 'test_user';
  process.env.POSTGRES_PASSWORD = 'test_password';
  process.env.POSTGRES_DB = 'test_db';

  console.log(`Test database configured: ${container.getHost()}:${container.getFirstMappedPort()}`);
}