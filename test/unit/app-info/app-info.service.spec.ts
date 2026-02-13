import { Test, TestingModule } from '@nestjs/testing';
import { AppInfoService } from '../../../src/app-info/app-info.service';

describe('AppInfoService', () => {
  let service: AppInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppInfoService],
    }).compile();

    service = module.get<AppInfoService>(AppInfoService);
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
});
