import type { Logger } from "pino";

import { createFactory } from "hono/factory";

import { auth } from "./auth";

// Define the Environment type for the entire app
export type Env = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    logger: Logger;
  };
};

// Create factory with shared Env type
// This ensures type inference across app, middleware, and handlers
export const factory = createFactory<Env>();
