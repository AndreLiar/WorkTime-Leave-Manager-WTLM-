import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthResponse } from './interfaces/health-response.interface';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  checkHealth(): HealthResponse {
    return this.healthService.getHealthStatus();
  }
}
