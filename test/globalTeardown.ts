import { stopPostgreSqlTestContainer } from './testcontainers-config';

export default async function globalTeardown() {
  console.log('Stopping TestContainers setup...');

  // Stop the PostgreSQL container after all tests
  await stopPostgreSqlTestContainer();

  console.log('TestContainers stopped');
}