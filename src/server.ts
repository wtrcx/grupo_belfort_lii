import './config/moduleAliases';
import 'reflect-metadata';

import './database';
import './cache';
import ScriptList from '@services/scriptService';

import express from 'express';
import 'express-async-errors';

import { config } from 'dotenv';

import ServerError from '@errors/serverError';

import routes from './routes';
import exceptionHandler from './middlewares/exceptionHandler';

const app = express();

config({
  path:
    process.env.NODE_ENV === 'dev'
      ? './environment/.env.dev'
      : './environment/.env.prod',
});

if (!process.env.APP_PORT) {
  throw new ServerError('Internal server error');
}

app.use(express.json());
app.use(routes);
app.use(exceptionHandler);

app.listen(process.env.APP_PORT, () => {
  ScriptList.init();
  console.log(`Online server on port ${process.env.APP_PORT}`);
});
