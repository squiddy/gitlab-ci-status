import express = require("express");

import { WebhookHandler } from "./types";

export function createWebhookHandler(token: string, callback: WebhookHandler) {
  return (req: express.Request, res: express.Response) => {
    if (req.header("x-gitlab-token") !== token) {
      res.sendStatus(400).send("invalid token");
    }

    callback(req.body);
    res.end();
  };
}
