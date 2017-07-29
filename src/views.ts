import path = require("path");
import fs = require("fs");
import url = require("url");

import express = require("express");

import { State } from "./state";
import { Avatar } from "./types";

function includeSvg(name: string): string {
  return fs.readFileSync(path.join(__dirname, `public/${name}.svg`), "utf-8");
}

const icons = {
  failed: includeSvg("failed"),
  success: includeSvg("success"),
  skipped: includeSvg("skipped"),
  canceled: includeSvg("skipped"),
  running: includeSvg("running"),
  created: includeSvg("created")
};

const imageBaseUrl = "http://gitlab.bof.mm.local";

function getAvatarImage(obj?: Avatar): string {
  if (obj && obj.avatar_url) {
    // Handle both relative (gitlab) or absolute (e.g. gravatar) URLs.
    const parsed = url.parse(obj.avatar_url);

    let finalUrl;
    if (parsed.host) {
      finalUrl = obj.avatar_url;
    } else {
      finalUrl = imageBaseUrl + obj.avatar_url;
    }
    return `<img class="avatar" src="${finalUrl}" />`;
  } else {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
           viewBox="0 0 14 14"
           class="avatar avatar-empty">
        <circle cx="7" cy="7" r="6"></circle>
      </svg>
    `;
  }
}

export function index(req: express.Request, res: express.Response) {
  const state = req.app.locals.state as State;

  const pipelines = state.pipelines
    .sort((a, b) => {
      const isSmaller =
        new Date(a.object_attributes.created_at) <
        new Date(b.object_attributes.created_at);
      return isSmaller ? 1 : -1;
    })
    .map(p => {
      return `
        <li class="queue-entry pipeline">
          <div class="avatars">
            ${getAvatarImage(p.user)}
            ${getAvatarImage(p.project)}
          </div>
          <div class="info">
            <strong>${p.project.name}</strong>
            ${p.object_attributes.ref}
          </div>
          <div class="status-info status-${p.object_attributes.status}">
            ${p.object_attributes.status}
            ${icons[p.object_attributes.status]}
          </div>
        </li>
      `;
    })
    .join("\n");

  const builds = state.builds
    .sort((a, b) => {
      const isSmaller =
        new Date(a.build_started_at) < new Date(b.build_started_at);
      return isSmaller ? 1 : -1;
    })
    .map(b => {
      return `
        <li class="queue-entry build">
          <div class="info">
            <strong>${b.repository.name}</strong>
            ${b.ref}
          </div>
          ${b.build_name}
          <div class="status-info status-${b.build_status}">
            ${b.build_status}
            ${icons[b.build_status]}
          </div>
        </li>
      `;
    })
    .join("\n");

  res.send(`
    <!doctype html>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="10">
    <title>GitLab CI Status</title>
    <link rel="stylesheet" href="/main.css" />
    <body>
      <main>
        <div class="main-box">
          <h2 class="main-box-heading">Pipelines</h2>
          <ul class="queue">
            ${pipelines}
          </ul>
        </div>
        <div class="main-box">
          <h2 class="main-box-heading">Builds</h2>
          <ul class="queue">
            ${builds}
          </ul>
        </div>
      </main>
    </body>
  `);
}
