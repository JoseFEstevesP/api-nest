import { AppModule } from '@/app.module';
import { EmailService } from '@/services/email.service';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import 'reflect-metadata';
import * as request from 'supertest';
import { afterAll, beforeAll, vi } from 'vitest';

let app: INestApplication;
let server: any;

beforeAll(async () => {
	try {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideProvider(EmailService)
			.useValue({ sendMail: vi.fn().mockResolvedValue(true) })
			.compile();

		app = moduleRef.createNestApplication();
		await app.init();
		server = app.getHttpServer();
	} catch (error) {
		console.error('Error during test setup:', error);
		throw error;
	}
});

afterAll(async () => {
	if (app) {
		try {
			await app.close();
		} catch (error) {
			console.error('Error during test teardown:', error);
		}
	}
});

// Utilidad global para tests E2E
global.request = () => request(server);
global.app = app;
