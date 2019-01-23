import fs = require("fs");
import path = require("path");

import express, { Application } from "express";
import morgan from "morgan";
import bodyParser from "body-parser";
import compression from "compression";

import { State } from "./state";
import { persistState, restoreState } from "./utils";
import { createWebhookHandler, WebhookBuild, WebhookPipeline } from "./webhook";

interface ServerOptions {
  persistPath?: string;
  webhookSecret: string;
  port: number;
}

function createServer(options: ServerOptions): Application {
  const state = new State();
  if (options.persistPath) {
    restoreState(state, options.persistPath);
  }

  const handler = createWebhookHandler(options.webhookSecret, (data: any) => {
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

  app.set("etag", false);
  app.use(
    morgan(":date - :remote-addr - ':method :url' :status :response-time ms")
  );
  app.use(compression());

  const publicDir = path.join(__dirname, "../../client/build");
  app.use(express.static(publicDir));
  app.post("/webhook/", bodyParser.json(), handler);
  app.get("/initial", (req, res) => {
    const pipelines = Array.from(state.pipelines.values())
      .sort((a, b) => {
        const isSmaller = new Date(a.created_at) < new Date(b.created_at);
        return isSmaller ? 1 : -1;
      })
      .slice(0, 30);

    const data = pipelines.map(p => {
      return Object.assign({}, p, {
        builds: p.builds.map(id => state.builds.get(id))
      });
    });

    res.type("json").send(data);
  });
  app.get("/state", (req, res) => {
    res.type("json").send({
      builds: Array.from(state.builds.entries()),
      pipelines: Array.from(state.pipelines.entries())
    });
  });

  return app;
}

export function startServer(options: ServerOptions) {
  const app = createServer(options);
  return app.listen(options.port, (err: string | null) => {
    if (err) {
      console.log(err);
    }

    console.log("Server running ...");
  });
}
