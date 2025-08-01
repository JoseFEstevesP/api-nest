import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { EnvironmentVariables } from './config/env.config';
import { objectError } from './functions/objectError';
import { globalMsg } from './globalMsg';
import { LoggerService } from './services/logger.service';

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: new LoggerService(),
	});

	const expressApp = app.getHttpAdapter().getInstance();
	expressApp.set('trust proxy', true);

	const configService = app.get(ConfigService<EnvironmentVariables>);

	app.enableCors({
		origin: configService.get<string[]>('CORS'),
		credentials: true,
		methods: 'GET,PATCH,POST,DELETE',
	});

	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: errors => {
				const result = errors.map(error => {
					return objectError({
						name: error.property,
						msg: error.constraints[Object.keys(error.constraints)[0]],
					});
				});

				return new BadRequestException(Object.assign({}, ...result));
			},
			stopAtFirstError: true,
		}),
	);

	app.setGlobalPrefix('api');

	app.use(cookieParser());

	const config = new DocumentBuilder()
		.setTitle(globalMsg.swagger.title)
		.setDescription(globalMsg.swagger.description)
		.setVersion(globalMsg.swagger.version)
		.addBearerAuth()
		.addTag(
			globalMsg.swagger.tags.user.name,
			globalMsg.swagger.tags.user.description,
		)
		.addTag(
			globalMsg.swagger.tags.rol.name,
			globalMsg.swagger.tags.rol.description,
		)
		.addTag(
			globalMsg.swagger.tags.audit.name,
			globalMsg.swagger.tags.audit.description,
		)
		.addTag(
			globalMsg.swagger.tags.auth.name,
			globalMsg.swagger.tags.auth.description,
		)
		.build();
	const document = SwaggerModule.createDocument(app, config);

	if (process.argv.includes('--generate-docs')) {
		const fs = require('fs');
		const path = require('path');

		const docsDir = path.join(process.cwd(), 'docs', 'swagger');
		if (!fs.existsSync(docsDir)) {
			fs.mkdirSync(docsDir, { recursive: true });
		}

		fs.writeFileSync(
			path.join(docsDir, 'swagger-spec.json'),
			JSON.stringify(document, null, 2),
			'utf8',
		);

		console.log(globalMsg.docs.generateSuccess);
		process.exit(0);
	}

	SwaggerModule.setup('doc', app, document);

	await app.listen(configService.get<number>('PORT'), '0.0.0.0');
}
bootstrap();
