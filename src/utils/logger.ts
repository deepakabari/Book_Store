import winston from 'winston';

export const logger = winston.createLogger({
    level: 'info', // Set the desired log level (e.g., 'info', 'error', 'debug')
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // Customize timestamp format
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} [${level}]: ${message}`;
        }),
    ),
    transports: [
        new winston.transports.Console(), // Log to console (you can add more transports here)
    ],
});
