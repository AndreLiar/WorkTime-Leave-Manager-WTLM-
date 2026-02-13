import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config } from './config/app.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (config.apiPrefix) {
    app.setGlobalPrefix(config.apiPrefix);
  }

  await app.listen(config.port);
  console.log(`Application is running on: ${await app.getUrl()}`);
  console.log(`Environment: ${config.nodeEnv}`);
}
bootstrap();
