import './config/moduleAliases';
import 'reflect-metadata';

import './database';
import './cache';
import ScriptService from '@services/scriptService';

import express from 'express';
import 'express-async-errors';

import { config } from 'dotenv';

import ServerError from '@errors/serverError';

import routes from './routes';
import exceptionHandler from './middlewares/exceptionHandler';

const app = express();

app.use(express.json());
app.use(routes);
app.use(exceptionHandler);

config({
  path:
    process.env.NODE_ENV === 'dev'
      ? './environment/.env.dev'
      : './environment/.env.prod',
});

if (!process.env.APP_PORT) {
  throw new ServerError('Internal server error');
}

app.listen(process.env.APP_PORT, () => {
  ScriptService.init();
  console.log(`Online server on port ${process.env.APP_PORT}`);
});
