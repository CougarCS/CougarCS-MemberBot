import path from 'path';
import winston from 'winston';
import WinstonCloudwatch from 'winston-cloudwatch';
import AWS from 'aws-sdk';
import crypto from 'crypto';
import { name, version } from '../package.json';

AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

const startTime = new Date().toISOString();
const baseDir = path.dirname(path.dirname(__filename));

const cloudWatchTransport = new WinstonCloudwatch({
  name,
  logGroupName: `${name}@${version}`,
  logStreamName() {
    const date = new Date().toISOString().split('T')[0];
    return `prod-${date}-${crypto
      .createHash('md5')
      .update(startTime)
      .digest('hex')}`;
  },
});

function createProdLogger(toFilePath: string) {
  const relativeFilePath = path.relative(baseDir, toFilePath);
  return winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: name, file: relativeFilePath },
    level: process.env.LOG_LEVEL || 'info',
    transports: [cloudWatchTransport],
  });
}

export default createProdLogger;
