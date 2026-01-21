import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Aumentar límite de payload para manejar historiales de conversación largos
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));

  // Habilitar CORS para el frontend
  app.enableCors({
    origin: true, // Permitir todos los orígenes temporalmente
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Prefijo global para la API
  app.setGlobalPrefix('api');

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  
  logger.log(`🤖 AI Orchestrator corriendo en: http://localhost:${port}`);
  logger.log(`📡 API disponible en: http://localhost:${port}/api`);
  logger.log(`💬 Chat endpoint: http://localhost:${port}/api/chat/message`);
}
bootstrap();
