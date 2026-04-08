import type { Logger } from "pino";

import { auth } from "./auth";

// Define the Environment type for the entire app
export type Env = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
    logger: Logger;
  };
};
