import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private connected = false;

  onModuleInit() {
    const url = process.env.REDIS_URL;

    if (!url) {
      this.logger.warn('REDIS_URL not set — caching disabled');
      return;
    }

    this.client = new Redis(url, {
      tls: url.startsWith('rediss://')
        ? { rejectUnauthorized: false }
        : undefined,
      maxRetriesPerRequest: 2,
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.connected = true;
      this.logger.log('Redis connected');
    });

    this.client.on('error', (err) => {
      this.connected = false;
      this.logger.error(`Redis error: ${err.message}`);
    });

    this.client
      .connect()
      .catch((err) =>
        this.logger.error(`Redis connect failed: ${err.message}`),
      );
  }

  async onModuleDestroy() {
    if (this.client) await this.client.quit();
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.connected) return null;
    try {
      const raw = await this.client.get(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    if (!this.connected) return;
    try {
      await this.client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch {
      // cache failure is non-fatal
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (!this.connected || keys.length === 0) return;
    try {
      await this.client.del(...keys);
    } catch {
      // cache failure is non-fatal
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.connected) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) await this.client.del(...keys);
    } catch {
      // cache failure is non-fatal
    }
  }
}
