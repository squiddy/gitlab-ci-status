import request = require("supertest");

import { createServer } from "../src/server";

let app;

beforeEach(() => {
  app = createServer({
    port: 3000,
    webhookSecret: "test"
  });
});

test("url '/' works", () => {
  return request(app).get("/").expect(200);
});

test("url '/state' exposes current state", () => {
  return request(app).get("/state").expect(app.locals.state);
});

test("url '/webhook/' handles build events", () => {
  const spy = jest
    .spyOn(app.locals.state, "handleBuild")
    .mockImplementation(() => null);
  return request(app)
    .post("/webhook/")
    .set("x-gitlab-token", "test")
    .send({ object_kind: "build" })
    .expect(200)
    .expect(res => {
      expect(spy).toHaveBeenCalledWith({ object_kind: "build" });
    });
});

test("url '/webhook/' handles pipeline events", () => {
  const spy = jest
    .spyOn(app.locals.state, "handlePipeline")
    .mockImplementation(() => null);
  return request(app)
    .post("/webhook/")
    .set("x-gitlab-token", "test")
    .send({ object_kind: "pipeline" })
    .expect(200)
    .expect(res => {
      expect(spy).toHaveBeenCalledWith({ object_kind: "pipeline" });
    });
});

test("url '/webhook/' errors on unknown events", () => {
  return request(app)
    .post("/webhook/")
    .set("x-gitlab-token", "test")
    .send({ foobar: 3 })
    .expect(400, "invalid payload");
});

test("url '/webhook/' errors on invalid data", () => {
  return request(app)
    .post("/webhook/")
    .set("x-gitlab-token", "test")
    .send("sdf")
    .expect(400, "invalid payload");
});

test("url '/webhook/' errors on invalid token", () => {
  return request(app)
    .post("/webhook/")
    .set("x-gitlab-token", "invalid")
    .send({ foobar: 3 })
    .expect(400, "invalid token");
});
