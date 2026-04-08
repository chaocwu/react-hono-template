import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

import { auth } from "./lib/auth";
import type { Env } from "./lib/env";
import { error } from "./lib/utils";
import { pinoLogger } from "./middlewares/logger";
import { sessionMiddleware } from "./middlewares/session";
import tasks from "./routes/tasks";

// Create app with Env type
const app = new Hono<Env>();

// Request ID middleware - adds unique ID to each request for tracing
app.use("*", requestId());

// Pino logger middleware - logs request/response details
app.use("*", pinoLogger);

// CORS configuration
const corsOrigin = Bun.env.CORS_ORIGIN;
if (!corsOrigin) {
  throw new Error("CORS_ORIGIN environment variable is required");
}

app.use(
  "/*",
  cors({
    origin: corsOrigin,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: 86400,
    credentials: true,
  }),
);

// Session middleware - attaches user/session to context
app.use("*", sessionMiddleware);

// Health check endpoint
app.get("/health", (c) => c.text("Hono API is running!"));

// Better Auth route handler
app.on(["POST", "GET"], "/api/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

// Mount task routes
const routes = app.route("/tasks", tasks);

// Global error handler
app.onError((err, c) => {
  if (err.name === "ZodError") {
    return error(c, "params error", 400);
  }

  c.var.logger?.error({ err }, "Unhandled error");
  return error(c, "server error", 500);
});

export type AppType = typeof routes;
export default app;
