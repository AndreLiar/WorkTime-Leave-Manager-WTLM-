import { Injectable } from '@nestjs/common';
import { HealthResponse } from './interfaces/health-response.interface';

@Injectable()
export class HealthService {
  getHealthStatus(): HealthResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
