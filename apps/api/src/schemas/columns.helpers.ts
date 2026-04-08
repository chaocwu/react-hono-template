import { integer } from "drizzle-orm/sqlite-core";

export const timestamps = {
  createdAt: integer().$defaultFn(() => Date.now()),
  updatedAt: integer().$defaultFn(() => Date.now()),
};
