import { Module } from '@nestjs/common';
import { AppInfoModule } from './app-info/app-info.module';
import { HealthModule } from './modules/health/health.module';
import { LeaveRequestModule } from './modules/leave-request/leave-request.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    RedisModule,
    DatabaseModule,
    AppInfoModule,
    HealthModule,
    LeaveRequestModule,
  ],
})
export class AppModule {}
