const path = require('path');
const winston = require('winston');
const WinstonCloudwatch = require('winston-cloudwatch');
const AWS = require('aws-sdk');
const crypto = require('crypto');
const { name } = require('../../package.json');

AWS.config.update({ region: process.env.AWS_REGION || 'us-east-1' });

const logGroupName = name.substring(0, name.indexOf('@'));
const startTime = new Date().toISOString();
const baseDir = path.dirname(path.dirname(__filename));

const cloudWatchTransport = new WinstonCloudwatch({
	name: logGroupName,
	logGroupName,
	logStreamName() {
		const date = new Date().toISOString().split('T')[0];
		return `prod-${date}-${crypto
			.createHash('md5')
			.update(startTime)
			.digest('hex')}`;
	},
});

function createProdLogger(toFilePath) {
	const relativeFilePath = path.relative(baseDir, toFilePath);
	return winston.createLogger({
		format: winston.format.combine(
			winston.format.timestamp(),
			winston.format.errors({ stack: true }),
			winston.format.json(),
		),
		defaultMeta: { service: name, file: relativeFilePath },
		level: process.env.LOG_LEVEL || 'info',
		transports: [cloudWatchTransport],
	});
}

module.exports = createProdLogger;
