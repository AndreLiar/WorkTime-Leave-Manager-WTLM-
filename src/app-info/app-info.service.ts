import { Injectable } from '@nestjs/common';

@Injectable()
export class AppInfoService {
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
}
