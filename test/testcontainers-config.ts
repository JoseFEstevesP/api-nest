import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedTestContainer } from 'testcontainers';

// Global variables that will be set in globalSetup
declare global {
  var __TEST_POSTGRES_CONTAINER__: StartedTestContainer | undefined;
  var __TEST_DATABASE_CONFIG__: {
    dialect: 'postgres';
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  } | undefined;
}

export async function startPostgreSqlTestContainer(): Promise<StartedTestContainer> {
  if (global.__TEST_POSTGRES_CONTAINER__) {
    return global.__TEST_POSTGRES_CONTAINER__;
  }

  // If there's no global container, create a new one (for standalone usage)
  const container = await new PostgreSqlContainer('postgres:17-alpine')
    .withDatabase('test_db')
    .withUsername('test_user')
    .withPassword('test_password')
    .start();

  global.__TEST_POSTGRES_CONTAINER__ = container;
  return container;
}

export async function stopPostgreSqlTestContainer(): Promise<void> {
  if (global.__TEST_POSTGRES_CONTAINER__) {
    await global.__TEST_POSTGRES_CONTAINER__.stop();
    global.__TEST_POSTGRES_CONTAINER__ = undefined;
  }
}

export function getTestDatabaseConfig() {
  if (global.__TEST_DATABASE_CONFIG__) {
    return global.__TEST_DATABASE_CONFIG__;
  }

  if (global.__TEST_POSTGRES_CONTAINER__) {
    return {
      dialect: 'postgres' as const,
      host: global.__TEST_POSTGRES_CONTAINER__.getHost(),
      port: global.__TEST_POSTGRES_CONTAINER__.getFirstMappedPort(),
      username: 'test_user',
      password: 'test_password',
      database: 'test_db',
    };
  }

  throw new Error('PostgreSQL container not started. Call startPostgreSqlTestContainer first.');
}