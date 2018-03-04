const fs = require("fs");
const path = require("path");

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");

const { State } = require("./state");
const { persistState, restoreState } = require("./utils");
const { createWebhookHandler } = require("./webhook");

function createServer(options) {
  const state = new State();
  if (options.persistPath) {
    restoreState(state, options.persistPath);
  }

  const handler = createWebhookHandler(options.webhookSecret, data => {
    if (data.object_kind === "build") {
      state.handleBuild(data);
    } else if (data.object_kind === "pipeline") {
      state.handlePipeline(data);
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

function startServer(options) {
  const app = createServer(options);
  return app.listen(options.port, err => {
    if (err) {
      console.log(err);
    }

    console.log("Server running ...");
  });
}

module.exports = {
  createServer,
  startServer
};
