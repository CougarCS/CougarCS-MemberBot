const path = require('path');
const winston = require('winston');

const baseDir = path.dirname(path.dirname(__filename));

function createDevLogger(toFilePath) {
	const relativeFilePath = path.relative(baseDir, toFilePath);
	const logFormat = winston.format.printf(
		({ level, message, timestamp, stack }) =>
			`[${relativeFilePath}] ${timestamp} ${level}: ${stack || message}`,
	);
	return winston.createLogger({
		format: winston.format.combine(
			winston.format.colorize(),
			winston.format.timestamp({ format: 'MM/DD/YYYY HH:mm:ss' }),
			winston.format.errors({ stack: true }),
			logFormat,
		),
		level: process.env.LOG_LEVEL || 'debug',
		transports: [new winston.transports.Console()],
	});
}

module.exports = createDevLogger;
