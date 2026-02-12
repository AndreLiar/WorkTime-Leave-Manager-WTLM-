import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRoot', () => {
    it('should return root information', () => {
      const result = service.getRoot();
      expect(result).toEqual({
        message: 'Welcome to WorkTime Leave Manager API',
        version: '1.0.0',
        endpoints: {
          health: '/health',
          root: '/',
        },
      });
    });
  });

  describe('getHealth', () => {
    it('should return health status with ok', () => {
      const result = service.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });
});
