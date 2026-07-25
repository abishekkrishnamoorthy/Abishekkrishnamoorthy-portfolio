import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "../helpers/test-app.js";

describe("health endpoints", () => {
  it("returns liveness", async () => {
    const response = await request(app()).get("/health").expect(200);
    expect(response.body.data.status).toBe("ok");
    expect(response.body.meta.requestId).toBeTruthy();
  });

  it("returns readiness when Mongo is connected", async () => {
    const response = await request(app()).get("/health/ready").expect(200);
    expect(response.body.data).toMatchObject({ status: "ready", db: true });
  });
});
