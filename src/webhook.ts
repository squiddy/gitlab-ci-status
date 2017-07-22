import express = require("express");

import { WebhookHandler } from "./types";

export function createWebhookHandler(token: string, callback: WebhookHandler) {
  return (req: express.Request, res: express.Response) => {
    if (req.header("x-gitlab-token") !== token) {
      res.status(400).send("invalid token");
    }

    if (!req.body.object_kind) {
      res.status(400).send("invalid payload");
    }

    callback(req.body);
    res.end();
  };
}
