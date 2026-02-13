import { Test, TestingModule } from '@nestjs/testing';
import { AppInfoController } from '../../../src/app-info/app-info.controller';
import { AppInfoService } from '../../../src/app-info/app-info.service';

describe('AppInfoController', () => {
  let appInfoController: AppInfoController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppInfoController],
      providers: [AppInfoService],
    }).compile();

    appInfoController = app.get<AppInfoController>(AppInfoController);
  });

  describe('root', () => {
    it('should return welcome message', () => {
      const result = appInfoController.getRoot();
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('version');
    });
  });
});
