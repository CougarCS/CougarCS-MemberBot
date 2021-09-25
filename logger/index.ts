import dotenv from 'dotenv';
import winston from 'winston';
import devLoggerFactory from './dev-logger';
import prodLoggerFactory from './prod-logger';

dotenv.config();
declare type LogFactory = (toFilePath: string) => winston.Logger;

let loggerFactory: LogFactory;

if (process.env.NODE_ENV?.startsWith('dev')) loggerFactory = devLoggerFactory;
else loggerFactory = prodLoggerFactory;

export default loggerFactory;
