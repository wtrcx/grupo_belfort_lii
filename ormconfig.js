// eslint-disable-next-line @typescript-eslint/no-var-requires
const { config } = require('dotenv');

config({
  path:
    process.env.NODE_ENV === 'dev'
      ? './environment/.env.dev'
      : './environment/.env.prod',
});

module.exports = {
  type: 'postgres',
  host: process.env.TYPEORM_HOST,
  port: process.env.TYPEORM_PORT,
  username: process.env.TYPEORM_USERNAME,
  password: process.env.TYPEORM_PASSWORD,
  database: process.env.TYPEORM_DATABASE,
  timezone: process.env.TYPEORM_TIMEZONE,
  entities: [process.env.TYPEORM_MODELS],
  migrations: [process.env.TYPEORM_MIGRATION],
  cli: {
    migrationsDir: process.env.TYPEORM_MIGRATION_DIR,
  },
};
