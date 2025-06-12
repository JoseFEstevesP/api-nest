import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Rate Limiting', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app.init();
	});

	it('should block after exceeding GLOBAL limit', async () => {
		const globalLimit = 5; // Límite bajo para pruebas
		const route = '/user'; // Ruta pública

		// Envía peticiones hasta superar el límite
		for (let i = 0; i < globalLimit + 2; i++) {
			const response = await request(app.getHttpServer()).get(route);
			console.log(
				`Petición ${i + 1}: Status ${response.status} text: ${response.text}`,
			);

			if (i >= globalLimit) {
				expect(response.status).toBe(429); // Espera 429 después del límite
			} else {
				expect(response.status).toBe(200); // Las primeras deben ser 200
			}
		}
	});

	afterAll(async () => {
		await app.close();
	});
});
