import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

import type { Env } from "../lib/env";
import { error, success } from "../lib/utils";
import { db } from "../lib/db";
import { taskInsertSchema, tasksTable, taskUpdateSchema } from "../schemas/tasks";

// Routes must be chained for Hono RPC type inference to work
const app = new Hono<Env>()
  .get("/", async (c) => {
    const result = await db.select().from(tasksTable);
    return success(c, result);
  })
  .post("/", zValidator("json", taskInsertSchema), async (c) => {
    const data = c.req.valid("json");
    const result = await db.insert(tasksTable).values(data).returning();
    return success(c, result);
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const result = await db
      .select()
      .from(tasksTable)
      .where(eq(tasksTable.id, id))
      .get();

    if (!result) {
      return error(c, "Task not found", 404);
    }

    return success(c, result);
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    const [result] = await db.delete(tasksTable).where(eq(tasksTable.id, id)).returning();

    if (!result) {
      return error(c, "Task not found", 404);
    }

    return success(c, result);
  })
  .patch("/:id", zValidator("json", taskUpdateSchema), async (c) => {
    const id = c.req.param("id");
    const updateData = c.req.valid("json");

    if (Object.keys(updateData).length === 0) {
      return error(c, "No update data provided", 400);
    }

    const [result] = await db
      .update(tasksTable)
      .set(updateData)
      .where(eq(tasksTable.id, id))
      .returning();

    if (!result) {
      return error(c, "Task not found", 404);
    }

    return success(c, result);
  });

export default app;
