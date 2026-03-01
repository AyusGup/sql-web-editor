import winston from 'winston';
import path from 'path';

const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} ${level}: ${stack || message}`;
    })
);

const logDir = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

export const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'worker-service' },
    transports: [
        new winston.transports.File({
            filename: path.join(logDir, 'worker-error.log'),
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(logDir, 'worker-combined.log'),
            maxsize: 10485760,
            maxFiles: 7,
        }),
    ],
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat,
    }));
}

export default logger;
