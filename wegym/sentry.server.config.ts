import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.NODE_ENV === 'production',
});
