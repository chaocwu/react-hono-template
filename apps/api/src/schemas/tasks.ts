import { createId } from "@paralleldrive/cuid2";
import { defineRelations } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-orm/zod";
import z from "zod";

import { timestamps } from "./columns.helpers";

export const tasksTable = sqliteTable("tasks", {
  id: text()
    .$defaultFn(() => createId())
    .primaryKey(),
  title: text().notNull(),
  document: text().notNull(),
  ...timestamps,
});

type Step = {
  step: string;
  expect: string;
};

export const testsTable = sqliteTable("tests", {
  id: text()
    .$defaultFn(() => createId())
    .primaryKey(),
  code: text().unique().notNull(),
  priority: text({ enum: ["P0", "P1", "P2"] }).notNull(),
  title: text().notNull(),
  preconditions: text({ mode: "json" }).$type<string[]>().default([]),
  steps: text({ mode: "json" }).$type<Step[]>().notNull(),
  taskId: text().notNull(),
  ...timestamps,
});

export const relations = defineRelations({ tasksTable, testsTable }, (r) => ({
  testsTable: {
    task: r.one.tasksTable({
      from: r.testsTable.taskId,
      to: r.tasksTable.id,
    }),
  },
  tasksTable: {
    tests: r.many.testsTable({
      from: r.tasksTable.id,
      to: r.testsTable.taskId,
    }),
  },
}));

export const taskInsertSchema = createInsertSchema(tasksTable, { title: z.string().min(2) });
export const taskSelectSchema = createSelectSchema(tasksTable);
export const taskUpdateSchema = createUpdateSchema(tasksTable);

export const testInsertSchema = createInsertSchema(testsTable);
export const testSelectSchema = createSelectSchema(testsTable);

export type Task = z.infer<typeof taskSelectSchema>;
export type TaskInsert = z.infer<typeof taskInsertSchema>;

export type Test = z.infer<typeof testSelectSchema>;
