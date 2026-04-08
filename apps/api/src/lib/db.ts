import { drizzle } from "drizzle-orm/libsql";

import { relations } from "../schemas/tasks";

export const db = drizzle(process.env.DB_FILE_NAME!, { relations, casing: "snake_case" });
