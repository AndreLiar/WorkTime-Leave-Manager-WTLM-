import { Module } from '@nestjs/common';
import { AppInfoModule } from './app-info/app-info.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [AppInfoModule, HealthModule],
})
export class AppModule {}
