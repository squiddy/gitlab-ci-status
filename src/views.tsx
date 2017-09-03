import path = require("path");
import fs = require("fs");
import url = require("url");
import React = require("react");
import { renderToStaticMarkup } from "react-dom/server";

import express = require("express");
import * as d3 from "d3-array";
import {
  differenceInHours,
  differenceInSeconds,
  distanceInWords,
  format
} from "date-fns";

import { State } from "./state";
import { Avatar, Build, Pipeline, Status } from "./types";

function includeSvg(name: string): string {
  return fs.readFileSync(path.join(__dirname, `public/${name}.svg`), "utf-8");
}

const icons = {
  failed: includeSvg("failed"),
  success: includeSvg("success"),
  skipped: includeSvg("skipped"),
  canceled: includeSvg("skipped"),
  running: includeSvg("running"),
  created: includeSvg("created"),
  pending: includeSvg("pending")
};

function StatusIcon({ status }: { status: Status }) {
  // Renders a visual icon for the build/pipeline status.
  const data = icons[status] as string;
  return <div dangerouslySetInnerHTML={{ __html: data }} />;
}

function AvatarImage({ obj }: { obj?: Avatar }) {
  // Renders the avatar of either a user or project, if available. Falls back to
  // a svg placeholder otherwise.
  const imageBaseUrl = "http://gitlab.bof.mm.local";

  if (obj && obj.avatar_url) {
    // Handle both relative (gitlab) or absolute (e.g. gravatar) URLs.
    const parsed = url.parse(obj.avatar_url);

    let finalUrl;
    if (parsed.host) {
      finalUrl = obj.avatar_url;
    } else {
      finalUrl = imageBaseUrl + obj.avatar_url;
    }
    return <img className="avatar" src={finalUrl} />;
  } else {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 14 14"
        className="avatar avatar-empty"
      >
        <circle cx="7" cy="7" r="6" />
      </svg>
    );
  }
}

function Duration({ start, end }: { start: string; end?: string }) {
  // Renders a human readable difference between two dates.
  const duration = distanceInWords(
    new Date(end || ""),
    new Date(start).getTime()
  );

  return (
    <div className="duration">
      {duration}
    </div>
  );
}

function Pipeline({ pipeline }: { pipeline: Pipeline }) {
  // Renders a single pipeline.
  let cssClass = "";
  if (pipeline.finished_at) {
    const finished = new Date(pipeline.finished_at);
    cssClass = getAgeCssClass(finished);
  }

  return (
    <li className={`queue-entry ${cssClass}`}>
      <div className="queue-entry-body">
        <div className="avatars">
          <AvatarImage obj={pipeline.user} />
          <AvatarImage obj={pipeline.project} />
        </div>
        <div className="info">
          <strong>
            {pipeline.project.name}
          </strong>
          {pipeline.ref}
        </div>
        <div className={`status-info status-${pipeline.status}`}>
          {pipeline.status}
          <StatusIcon status={pipeline.status} />
        </div>
      </div>
      <div className="queue-entry-footer">
        <Duration start={pipeline.created_at} end={pipeline.finished_at} />
      </div>
    </li>
  );
}

export function getAgeCssClass(date: Date): string {
  const hoursOld = differenceInHours(Date.now(), date);
  if (hoursOld > 4) {
    return "age-old";
  }
  return "";
}

function Main({ pipelines }: { pipelines: Pipeline[] }) {
  return (
    <main>
      <ul className="queue">
        {pipelines.map((p, idx) => <Pipeline pipeline={p} key={idx} />)}
      </ul>
    </main>
  );
}

export function index(req: express.Request, res: express.Response) {
  const state = req.app.locals.state as State;

  const pipelines = Array.from(state.pipelines.values())
    .sort((a, b) => {
      const isSmaller = new Date(a.created_at) < new Date(b.created_at);
      return isSmaller ? 1 : -1;
    })
    .slice(0, 30);

  const html = renderToStaticMarkup(<Main pipelines={pipelines} />);

  res.send(`
    <!doctype html>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="10000000">
    <title>GitLab CI Status</title>
    <link rel="stylesheet" href="/main.css" />
    <body>
      ${html}
      <nav>
        <a href="/state">State</a>
        <a href="/stats">Stats</a>
      </nav>
    </body>
  `);
}

export function stats(req: express.Request, res: express.Response) {
  const state = req.app.locals.state as State;

  const buildCount = state.builds.size;
  const pipelineCount = state.pipelines.size;
  const successfulPipelineCount = Array.from(state.pipelines.values()).filter(
    p => p.status === "success"
  ).length;
  const successfulBuildCount = Array.from(state.builds.values()).filter(
    b => b.status === "success"
  ).length;

  const averageBuildRuntime = d3.mean(
    Array.from(state.builds.values()).map(b => {
      if (b.started_at && b.finished_at) {
        return differenceInSeconds(b.finished_at, b.started_at);
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
