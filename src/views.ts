import path = require("path");
import fs = require("fs");
import url = require("url");

import express = require("express");
import * as d3 from "d3-array";
import { differenceInHours, differenceInSeconds, format } from "date-fns";

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

export function getAgeCssClass(date: Date): string {
  const hoursOld = differenceInHours(Date.now(), date);
  if (hoursOld > 4) {
    return "age-old";
  }
  return "";
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
    .slice(0, 30)
    .map(p => {
      let cssClass = "";
      if (p.object_attributes.finished_at) {
        const finished = new Date(p.object_attributes.finished_at);
        cssClass = getAgeCssClass(finished);
      }
      return `
        <li class="queue-entry pipeline ${cssClass}">
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
    .filter(b => {
      const ignoreStates = ["skipped", "created"];
      return ignoreStates.indexOf(b.build_status) === -1;
    })
    .slice(0, 30)
    .map(b => {
      let cssClass = "";
      if (b.build_finished_at) {
        const finished = new Date(b.build_finished_at);
        cssClass = getAgeCssClass(finished);
      }

      return `
        <li class="queue-entry build ${cssClass}">
          <div class="info">
            <strong>${b.repository.name}</strong>
            ${b.ref}
          </div>
          <div class="name">
            ${b.build_name}
          </div>
          <div class="status-info status-${b.build_status}">
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
      <nav>
        <a href="/state">State</a>
        <a href="/stats">Stats</a>
      </nav>
    </body>
  `);
}

export function stats(req: express.Request, res: express.Response) {
  const state = req.app.locals.state as State;

  const pipelineCount = state.pipelines.length;
  const buildCount = state.builds.length;
  const successfulPipelineCount = state.pipelines.filter(
    p => p.object_attributes.status === "success"
  ).length;
  const successfulBuildCount = state.builds.filter(
    b => b.build_status === "success"
  ).length;

  const averageBuildRuntime = d3.mean(
    state.builds.map(b => {
      if (b.build_started_at && b.build_finished_at) {
        return differenceInSeconds(b.build_finished_at, b.build_started_at);
      } else {
        return NaN;
      }
    })
  );

  res.send(`
    <!doctype html>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="10">
    <title>GitLab CI Status - Stats</title>
    <link rel="stylesheet" href="/main.css" />
    <body>
      <main class="stats">
        <div class="stat">
          <strong>${pipelineCount}</strong>
          <span>Pipelines</span>
        </div>
        <div class="stat">
          <strong>${Math.round(
            successfulPipelineCount / pipelineCount * 100
          )}%</strong>
          <span>Pipelines successful</span>
        </div>
        <div class="stat">
          <strong>${buildCount}</strong>
          <span>Builds</span>
        </div>
        <div class="stat">
          <strong>${Math.round(
            successfulBuildCount / buildCount * 100
          )}%</strong>
          <span>Builds successful</span>
        </div>
        ${averageBuildRuntime
          ? `<div class="stat">
               <strong>${Math.round(averageBuildRuntime)}s</strong>
               <span>mean Build runtime</span>
             </div>`
          : null}
      </main>
    </body>
  `);
}
