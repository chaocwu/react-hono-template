import { createMiddleware } from "hono/factory";
import pino from "pino";

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

// Type-safe middleware using createMiddleware
export const pinoLogger = createMiddleware(async (c, next) => {
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
