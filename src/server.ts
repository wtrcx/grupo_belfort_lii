import './config/moduleAliases';
import 'reflect-metadata';
import './database';

import express from 'express';
import { config } from 'dotenv';

import routes from './routes';

const app = express();

config({
  path:
    process.env.NODE_ENV === 'dev'
      ? './environment/.env.dev'
      : './environment/.env.prod',
});

app.use(express.json());
app.use(routes);

app.listen(process.env.APP_PORT, () => {
  console.log(`Online server on port ${process.env.APP_PORT}`);
});
