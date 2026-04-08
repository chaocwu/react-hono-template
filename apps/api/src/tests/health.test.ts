/**
 * Health check endpoint tests
 */
import { describe, it, expect } from "bun:test";

import app from "../index";

describe("GET /health", () => {
  it("should return 200 with success message", async () => {
    const res = await app.request("/health");

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("Hono API is running!");
  });
});
