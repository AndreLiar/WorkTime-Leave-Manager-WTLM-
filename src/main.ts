import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  if (config.nodeEnv === 'development') {
    app.enableCors();
  }

  if (config.apiPrefix) {
    app.setGlobalPrefix(config.apiPrefix);
  }

  await app.listen(config.port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${config.nodeEnv}`);
}
bootstrap();
