import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: ['http://localhost:7171', 'http://localhost:3000', 'http://localhost:8000'],
    credentials: true,
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global de API
  app.setGlobalPrefix('api');

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Auth Service - Sistema Chifles')
    .setDescription('Microservicio de Autenticación con JWT Access/Refresh Tokens')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Endpoints de autenticación')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`
  🔐 Auth Service iniciado correctamente
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📡 Puerto: ${port}
  📚 Swagger: http://localhost:${port}/docs
  🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
}

bootstrap();
