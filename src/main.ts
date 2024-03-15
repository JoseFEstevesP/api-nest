import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = {
          errors: errors.map((error) => ({
            [error.property]:
              error.constraints[Object.keys(error.constraints)[0]],
          })),
        };
        return new BadRequestException(result);
      },
      stopAtFirstError: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Documentación API')
    .setDescription('Esta es la documentación de la API usando nest')
    .setVersion('1.0')
    .addTag('User')
    .addTag('Rol')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, document);

  await app.listen(process.env.PORT);
}
bootstrap();
