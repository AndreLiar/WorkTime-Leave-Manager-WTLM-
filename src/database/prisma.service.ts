import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://wtlm_user:wtlm_password@localhost:5432/wtlm_db';
    const isRemote =
      connectionString.includes('.render.com') ||
      connectionString.includes('render.com');
    const pool = new Pool({
      connectionString,
      ssl: isRemote ? { rejectUnauthorized: false } : false,
    });
    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
