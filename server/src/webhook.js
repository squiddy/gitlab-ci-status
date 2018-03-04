const express = require("express");

function createWebhookHandler(token, callback) {
  return (req, res) => {
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

module.exports = {
  createWebhookHandler
};
