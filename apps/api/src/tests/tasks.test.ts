/**
 * Tasks API tests
 * Uses in-memory database via NODE_ENV=test
 */
import { describe, it, expect, beforeAll } from "bun:test";

import { db } from "../lib/db";
import app from "../routes/tasks";

describe("Tasks API", () => {
  beforeAll(async () => {
    // Create tasks table in in-memory database
    await db.run(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        document TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),
        updated_at INTEGER NOT NULL DEFAULT (unixepoch())
      )
    `);
  });

  describe("GET /", () => {
    it("should return empty array when no tasks exist", async () => {
      const res = await app.request("/");
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toEqual([]);
    });
  });

  describe("POST /", () => {
    it("should create a new task", async () => {
      const newTask = {
        title: "Test Task",
        document: "Test Description",
      };

      const res = await app.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data[0]).toMatchObject(newTask);
      expect(json.data[0].id).toBeDefined();
      expect(json.data[0].createdAt).toBeDefined();
      expect(json.data[0].updatedAt).toBeDefined();
    });

    it("should return 400 for invalid input", async () => {
      const invalidTask = {
        // missing required title
        document: "Test Description",
      };

      const res = await app.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invalidTask),
      });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /:id", () => {
    it("should return task by id", async () => {
      // First create a task
      const newTask = {
        title: "Task to Get",
        document: "Description",
      };

      const createRes = await app.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const createJson = await createRes.json();
      const taskId = createJson.data[0].id;

      // Then get it by id
      const res = await app.request(`/${taskId}`);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toMatchObject(newTask);
      expect(json.data.id).toBe(taskId);
    });

    it("should return 404 for non-existent task", async () => {
      const res = await app.request("/non-existent-id");
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.message).toBe("Task not found");
    });
  });

  describe("PATCH /:id", () => {
    it("should update task", async () => {
      // Create a task first
      const newTask = {
        title: "Task to Update",
        document: "Original Description",
      };

      const createRes = await app.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const createJson = await createRes.json();
      const taskId = createJson.data[0].id;

      // Update it
      const updateData = { title: "Updated Title" };
      const res = await app.request(`/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.title).toBe("Updated Title");
      expect(json.data.document).toBe("Original Description"); // unchanged
    });

    it("should return 400 for empty update", async () => {
      // Create a task first
      const newTask = { title: "Task", document: "Desc" };
      const createRes = await app.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const createJson = await createRes.json();
      const taskId = createJson.data[0].id;

      // Try to update with empty body
      const res = await app.request(`/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.message).toBe("No update data provided");
    });

    it("should return 404 for non-existent task", async () => {
      const res = await app.request("/non-existent-id", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Title" }),
      });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.message).toBe("Task not found");
    });
  });

  describe("DELETE /:id", () => {
    it("should delete task", async () => {
      // Create a task first
      const newTask = { title: "Task to Delete", document: "Description" };
      const createRes = await app.request("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      const createJson = await createRes.json();
      const taskId = createJson.data[0].id;

      // Delete it
      const res = await app.request(`/${taskId}`, { method: "DELETE" });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.id).toBe(taskId);

      // Verify it's gone
      const getRes = await app.request(`/${taskId}`);
      expect(getRes.status).toBe(404);
    });

    it("should return 404 for non-existent task", async () => {
      const res = await app.request("/non-existent-id", { method: "DELETE" });
      const json = await res.json();

      expect(res.status).toBe(404);
      expect(json.message).toBe("Task not found");
    });
  });
});
