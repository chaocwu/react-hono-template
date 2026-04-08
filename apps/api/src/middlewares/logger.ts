import pino from "pino";

import { factory } from "../lib/factory";

export const logger = pino({
  level: "info",
  transport: {
    targets: [
      {
        target: "pino-pretty",
        options: { destination: 1 },
      },
      {
        target: "pino-roll",
        options: {
          file: "./logs/app",
          extension: ".log",
          frequency: "daily",
          dateFormat: "yyyy-MM-dd",
          mkdir: true,
          limit: {
            count: 7,
          },
        },
      },
    ],
  },
});

// Type-safe middleware using factory.createMiddleware
// Inherits Env type from factory, no need to pass generics
export const pinoLogger = factory.createMiddleware(async (c, next) => {
  const { method, url } = c.req;
  const start = Date.now();

  c.set("logger", logger);

  await next();

  const ms = Date.now() - start;

  logger.info({
    method,
    url,
    status: c.res.status,
    duration: `${ms}ms`,
    threadId: c.get("requestId"),
  });
});
