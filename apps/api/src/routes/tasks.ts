import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";

import { factory } from "../lib/factory";
import { error, success } from "../lib/utils";
import { db } from "../lib/db";
import { taskInsertSchema, tasksTable, taskUpdateSchema } from "../schemas/tasks";

// Create typed router using factory
// Routes are chained to preserve type inference for RPC
const app = factory.createApp()
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
    const result = await db.query.tasksTable.findFirst({
      where: {
        id: id,
      },
    });

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
      .set({
        ...updateData,
      })
      .where(eq(tasksTable.id, id))
      .returning();

    if (!result) {
      return error(c, "Task not found", 404);
    }

    return success(c, result);
  });

export default app;
