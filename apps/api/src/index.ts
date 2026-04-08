import { Hono } from "hono";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";

import { auth } from "./lib/auth";
import { error } from "./lib/utils";
import { pinoLogger } from "./middlewares/logger";
import { sessionMiddleware } from "./middlewares/session";
import tasks from "./routes/tasks";

const app = new Hono();

app.use("*", requestId());
app.use("*", pinoLogger);

app.use(
  "/*",
  cors({
    origin: process.env.CORS_ORIGIN!,
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
const routes = app.basePath("/api").route("/tasks", tasks);

// Global error handler
app.onError((err, c) => {
  if (err.name === "ZodError") {
    return error(c, "params error", 400);
  }
  return error(c, "server error", 500);
});

export type AppType = typeof routes;
export default app;
