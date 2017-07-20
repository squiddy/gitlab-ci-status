import path = require("path");
import fs = require("fs");

import express = require("express");

import { State } from "./state";

function includeSvg(name: string): string {
  return fs.readFileSync(path.join(__dirname, `public/${name}.svg`), "utf-8");
}

const icons = {
  failed: includeSvg("failed"),
  success: includeSvg("success"),
  skipped: includeSvg("skipped"),
  running: includeSvg("running"),
  created: includeSvg("created")
};

const imageBaseUrl = "http://gitlab.bof.mm.local";

function getProjectAvatarImage(project: any): string {
  if (project.avatar_url) {
    return `<img class="avatar" src="${imageBaseUrl}${project.avatar_url}" />`;
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

function getUserAvatarImage(user: any): string {
  if (user && user.avatar_url) {
    return `<img class="avatar" src="${imageBaseUrl}${user.avatar_url}" />`;
  } else if (user) {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14"
           viewBox="0 0 14 14"
           class="avatar avatar-empty">
        <circle cx="7" cy="7" r="6"></circle>
      </svg>
    `;
  } else {
    return "";
  }
}

export function index(req: express.Request, res: express.Response) {
  const state = <State>req.app.locals.state;

  const pipelines = state.pipelines
    .sort((a, b) => {
      return +(a.object_attributes.created_at < b.object_attributes.created_at);
    })
    .map(p => {
      return `
        <li class="queue-entry pipeline">
          <div class="avatars">
            ${getUserAvatarImage(p.user)}
            ${getProjectAvatarImage(p.project)}
          </div>
          <div class="info">
            <strong>${p.project.name}</strong>
            ${p.object_attributes.ref}
          </div>
          <div class="status-info status-${p.object_attributes.status}">
            ${p.object_attributes.status}
            ${icons[p.object_attributes.status]}
          </div>
          <div class="id">
            ${p.object_attributes.id}
          </div>
        </li>
      `;
    })
    .join("\n");

  const builds = state.builds
    .sort((a, b) => {
      return +(a.build_started_at < b.build_started_at);
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
          <div class="id">
            ${b.build_id}
          </div>
        </li>
      `;
    })
    .join("\n");

  res.send(`
    <!doctype html>
    <meta charset="utf-8" />
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
