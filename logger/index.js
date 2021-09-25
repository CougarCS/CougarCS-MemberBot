require('dotenv').config();
const devLoggerFactory = require('./dev-logger');
const prodLoggerFactory = require('./prod-logger');

let loggerFactory;
if (process.env.NODE_ENV?.startsWith('dev')) loggerFactory = devLoggerFactory;
else loggerFactory = prodLoggerFactory;

export default loggerFactory;
