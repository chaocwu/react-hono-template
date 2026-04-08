import type { ContentfulStatusCode } from "hono/utils/http-status";

import { type Context } from "hono";

type ResponsePayload<T> = {
  data: T;
  message: string;
  success: boolean;
};

export const success = <T>(c: Context, data: T, message = "success") => {
  return c.json({ data, message, success: true } as ResponsePayload<T>, 200);
};

export const error = (c: Context, message = "error", status: ContentfulStatusCode = 400) => {
  return c.json({ data: null, message, success: false } as ResponsePayload<null>, status);
};
