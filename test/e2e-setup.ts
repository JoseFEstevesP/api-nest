import 'reflect-metadata';
import { AppModule } from '@/app.module';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll } from 'vitest';
import * as request from 'supertest';

let app;
let server;

beforeAll(async () => {
	const moduleRef = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleRef.createNestApplication();
	await app.init();
	server = app.getHttpServer();
});

afterAll(async () => {
	await app.close();
});

// Utilidad global para tests E2E
global.request = () => request(server);
global.app = app;
