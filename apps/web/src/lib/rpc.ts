import type { AppType } from "@template/api/index";

import { hc } from "hono/client";

export const client = hc<AppType>(import.meta.env.VITE_API_URL, {
  init: {
    credentials: "include",
  },
});
