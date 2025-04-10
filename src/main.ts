import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(process.env.PORT || 5000);
}
bootstrap();
