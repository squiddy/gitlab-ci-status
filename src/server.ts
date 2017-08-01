import fs = require("fs");
import path = require("path");

import express = require("express");
import bodyParser = require("body-parser");

import { State } from "./state";
import { Options, WebhookBuild, WebhookPipeline } from "./types";
import { persistState, restoreState } from "./utils";
import { index, stats } from "./views";
import { createWebhookHandler } from "./webhook";

export function createServer(options: Options) {
  const state = new State();
  if (options.persistPath) {
    restoreState(state, options.persistPath);
  }

  const handler = createWebhookHandler("test", data => {
    if (data.object_kind === "build") {
      state.handleBuild(data as WebhookBuild);
    } else if (data.object_kind === "pipeline") {
      state.handlePipeline(data as WebhookPipeline);
    }

    if (options.persistPath) {
      persistState(state, options.persistPath);
    }
  });

  const app = express();
  app.locals.state = state;

  const publicDir = path.join(__dirname, "public");
  app.use(express.static(publicDir));
  app.post("/webhook/", bodyParser.json(), handler);
  app.get("/", index);
  app.get("/stats", stats);
  app.get("/state", (req, res) => {
    res.type("json").send(state);
  });

  return app;
}

export function startServer(options: Options) {
  const app = createServer(options);
  app.listen(options.port);
}
