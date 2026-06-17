import pino from 'pino';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
  redact: {
    paths: ['req.headers.cookie', 'req.headers.authorization', 'body.password', 'body.token'],
    censor: '[REDACTED]',
  },
});
