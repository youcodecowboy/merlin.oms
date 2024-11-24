const winston = require('winston');
const path = require('path');

// Custom format for detailed error logging
const errorFormat = winston.format((info) => {
  if (info.error instanceof Error) {
    return {
      ...info,
      stack: info.error.stack,
      error: {
        name: info.error.name,
        message: info.error.message,
        stack: info.error.stack
      }
    };
  }
  return info;
});

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
require('fs').mkdirSync(logsDir, { recursive: true });

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    errorFormat(),
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'express-api' },
  transports: [
    // Console logging with colors and simplified format
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, stack, ...meta }) => {
          const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
          return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}${metaStr}`;
        })
      )
    }),
    // Error logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.json()
      )
    }),
    // All logs
    new winston.transports.File({ 
      filename: path.join(logsDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.uncolorize(),
        winston.format.json()
      )
    })
  ]
});

// Log unhandled rejections
process.on('unhandledRejection', (error) => {
  logger.error('Unhandled Rejection:', { error });
});

// Log uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', { error });
  process.exit(1);
});

module.exports = logger;