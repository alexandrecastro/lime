import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  // VERSIONING
  app.setGlobalPrefix('api/v1');

  await app.listen(3000);
  console.log(
    '✓ LIME application (built by Castro) is running on: http://localhost:3000'
  );
}

bootstrap();
