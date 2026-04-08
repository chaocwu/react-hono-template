import { drizzle } from "drizzle-orm/libsql";

import { relations } from "../schemas/tasks";

// Use environment variable or default to file-based database
// In test environment, use in-memory database
const dbUrl = process.env.NODE_ENV === "test" ? ":memory:" : (process.env.DB_FILE_NAME ?? "file:local.db");

export const db = drizzle(dbUrl, { relations, casing: "snake_case" });
