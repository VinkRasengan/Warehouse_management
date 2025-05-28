import winston from 'winston';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, service, correlationId, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service,
      correlationId,
      ...meta
    });
  })
);

export const createLogger = (serviceName: string) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: serviceName },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      new winston.transports.File({
        filename: `logs/${serviceName}-error.log`,
        level: 'error'
      }),
      new winston.transports.File({
        filename: `logs/${serviceName}.log`
      })
    ]
  });
};

export const logger = createLogger('shared');
