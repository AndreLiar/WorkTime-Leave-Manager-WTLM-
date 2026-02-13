describe('App configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should use default values when env vars are missing', () => {
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.API_PREFIX;

    jest.isolateModules(() => {
      const { config } = require('../../../src/config/app.config');
      expect(config.port).toBe(3000);
      expect(config.nodeEnv).toBe('development');
      expect(config.apiPrefix).toBe('');
    });
  });

  it('should read environment overrides', () => {
    process.env.PORT = '4000';
    process.env.NODE_ENV = 'production';
    process.env.API_PREFIX = '/api';

    jest.isolateModules(() => {
      const { config } = require('../../../src/config/app.config');
      expect(config.port).toBe('4000');
      expect(config.nodeEnv).toBe('production');
      expect(config.apiPrefix).toBe('/api');
    });
  });
});
