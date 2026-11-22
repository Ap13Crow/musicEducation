import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  // Errors are logged as { error }; pino only formats `err` by default,
  // so without this every Error was logged as {}.
  serializers: { error: pino.stdSerializers.err },
  transport:
    process.env.NODE_ENV !== 'production'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
