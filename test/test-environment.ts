import { startPostgreSqlTestContainer, stopPostgreSqlTestContainer } from './testcontainers-config';
import { beforeAll, afterAll } from '@jest/globals';

export default async function setupTestEnvironment() {
  console.log('Starting TestContainers setup...');
  
  // Start the PostgreSQL container before all tests
  await startPostgreSqlTestContainer();
  
  // Set environment variables for the test database
  const container = await startPostgreSqlTestContainer();
  process.env.DATABASE_DIALECT = 'postgres';
  process.env.DATABASE_HOST = container.getHost();
  process.env.DATABASE_PORT = container.getPort().toString();
  process.env.POSTGRES_USER = 'test_user';
  process.env.POSTGRES_PASSWORD = 'test_password';
  process.env.POSTGRES_DB = 'test_db';
  
  console.log(`Test database configured: ${container.getHost()}:${container.getPort()}`);
  
  // Setup function that Jest will call
  return {
    async setup() {
      // Setup logic if needed
    },
    async teardown() {
      // Stop the container after all tests
      await stopPostgreSqlTestContainer();
      console.log('Stopped TestContainers setup');
    },
    async globalSetup() {
      // Global setup logic if needed
    },
    async globalTeardown() {
      // Global teardown - stop containers
      await stopPostgreSqlTestContainer();
      console.log('Global teardown: TestContainers stopped');
    }
  };
}