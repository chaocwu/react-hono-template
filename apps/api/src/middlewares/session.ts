import { auth } from "../lib/auth";
import { factory } from "../lib/factory";

// Session middleware - uses cookie cache to minimize DB queries
// With cookieCache enabled, getSession reads from cookie first, only hitting DB when needed
export const sessionMiddleware = factory.createMiddleware(async (c, next) => {
  try {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session) {
      c.set("user", null);
      c.set("session", null);
    } else {
      c.set("user", session.user);
      c.set("session", session.session);
    }
  } catch {
    // If session validation fails (e.g., invalid cookie), continue as unauthenticated
    c.set("user", null);
    c.set("session", null);
  }
  await next();
});
