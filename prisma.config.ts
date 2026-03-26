import { defineConfig } from 'prisma/config';

const connectionString =
  process.env['DATABASE_URL'] ||
  'postgresql://wtlm_user:wtlm_password@localhost:5432/wtlm_db';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: connectionString,
  },
});
