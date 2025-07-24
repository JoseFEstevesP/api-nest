import { AppModule } from '@/app.module';
import { Test } from '@nestjs/testing';
import { afterAll, beforeAll } from 'vitest';

let app;

beforeAll(async () => {
	const moduleRef = await Test.createTestingModule({
		imports: [AppModule],
	}).compile();

	app = moduleRef.createNestApplication();
	await app.init(); // Inicializa la aplicación NestJS
});

afterAll(async () => {
	await app.close(); // Cierra la aplicación después de las pruebas
});
