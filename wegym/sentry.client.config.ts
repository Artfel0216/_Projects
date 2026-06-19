import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE) || 0.1,
  integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV || 'development',
  enabled: process.env.NODE_ENV === 'production',
});
