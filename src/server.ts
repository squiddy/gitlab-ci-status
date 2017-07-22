import fs = require("fs");
import path = require("path");

import express = require("express");
import bodyParser = require("body-parser");

import { WebhookBuild, WebhookPipeline, Options } from "./types";
import { createWebhookHandler } from "./webhook";
import { State } from "./state";
import { debugRestore, debugPersist } from "./utils";
import { index } from "./views";

export function createServer(options: Options) {
  const state = new State();
  if (options.persistPath) {
    debugRestore(state, options.persistPath);
  }

  const handler = createWebhookHandler("test", data => {
    if (data.object_kind === "build") {
      state.handleBuild(<WebhookBuild>data);
    } else if (data.object_kind === "pipeline") {
      state.handlePipeline(<WebhookPipeline>data);
    }

    if (options.persistPath) {
      debugPersist(state, options.persistPath);
    }
  });

  const app = express();
  app.locals.state = state;

  const publicDir = path.join(__dirname, "public");
  app.use(express.static(publicDir));
  app.post("/webhook/", bodyParser.json(), handler);
  app.get("/", index);
  app.get("/state", (req, res) => {
    res.type("json").send(state);
  });

  return app;
}

export function startServer(options: Options) {
  const app = createServer(options);
  app.listen(options.port);
}
