const dotenv = require('dotenv');
const devLoggerFactory = require('./dev-logger');
const prodLoggerFactory = require('./prod-logger');
dotenv.config();

const NODE_ENV = process.env.NODE_ENV;

let loggerFactory;
if (NODE_ENV && NODE_ENV.startsWith('dev')) loggerFactory = devLoggerFactory;
else loggerFactory = prodLoggerFactory;

module.exports = loggerFactory;
