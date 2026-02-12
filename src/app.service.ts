import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getRoot(): object {
    return {
      message: 'Welcome to WorkTime Leave Manager API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        root: '/',
      },
    };
  }

  getHealth(): object {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
