import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'), {
    prefix: '/',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );

  // VERSIONING
  app.setGlobalPrefix('api/v1');

  // Swagger/OpenAPI Configuration
  const config = new DocumentBuilder()
    .setTitle('LIME API')
    .setDescription('LIME – A tenant-based claim management system.')
    .setVersion('1.0.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('admin', 'Admin management endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('tenants', 'Tenant management endpoints')
    .addTag('claims', 'Claim management endpoints')
    .addTag('config', 'Configuration management endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'LIME API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
    customfavIcon: '/lime.svg',
  });

  await app.listen(3000);
  console.log(
    '✓ LIME application (built by Castro) is running on: http://localhost:3000'
  );
  console.log(
    '✓ LIME API documentation available at: http://localhost:3000/api'
  );
}

bootstrap();
