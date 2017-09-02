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
import { Avatar, Status, WebhookBuild, WebhookPipeline } from "./types";

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

function Pipeline({ pipeline }: { pipeline: WebhookPipeline }) {
  // Renders a single pipeline.
  const attrs = pipeline.object_attributes;

  let cssClass = "";
  if (attrs.finished_at) {
    const finished = new Date(attrs.finished_at);
    cssClass = getAgeCssClass(finished);
  }

  return (
    <li className={`queue-entry ${cssClass}`}>
      <div className="queue-entry-body pipeline">
        <div className="avatars">
          <AvatarImage obj={pipeline.user} />
          <AvatarImage obj={pipeline.project} />
        </div>
        <div className="info">
          <strong>
            {pipeline.project.name}
          </strong>
          {attrs.ref}
        </div>
        <div className={`status-info status-${attrs.status}`}>
          {attrs.status}
          <StatusIcon status={attrs.status} />
        </div>
      </div>
      <div className="queue-entry-footer">
        <Duration
          start={pipeline.object_attributes.created_at}
          end={pipeline.object_attributes.finished_at}
        />
      </div>
    </li>
  );
}

function Build({ build }: { build: WebhookBuild }) {
  // Renders a single build.
  let cssClass = "";
  if (build.build_finished_at) {
    const finished = new Date(build.build_finished_at);
    cssClass = getAgeCssClass(finished);
  }

  return (
    <li className={`queue-entry ${cssClass}`}>
      <div className="queue-entry-body build">
        <div className="info">
          <strong>
            {build.repository.name}
          </strong>
          {build.ref}
        </div>
        <div className="name">
          {build.build_name}
        </div>
        <div className={`status-info status-${build.build_status}`}>
          <StatusIcon status={build.build_status} />
        </div>
      </div>
      <div className="queue-entry-footer">
        <Duration
          start={build.build_started_at}
          end={build.build_finished_at}
        />
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

function Main({
  builds,
  pipelines
}: {
  builds: WebhookBuild[];
  pipelines: WebhookPipeline[];
}) {
  return (
    <main>
      <div className="main-box">
        <h2 className="main-box-heading">Pipelines</h2>
        <ul className="queue">
          {pipelines.map((p, idx) => <Pipeline pipeline={p} key={idx} />)}
        </ul>
      </div>
      <div className="main-box">
        <h2 className="main-box-heading">Builds</h2>
        <ul className="queue">
          {builds.map((b, idx) => <Build build={b} key={idx} />)}
        </ul>
      </div>
    </main>
  );
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
    .slice(0, 30);

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
    .slice(0, 30);

  const html = renderToStaticMarkup(
    <Main builds={builds} pipelines={pipelines} />
  );

  res.send(`
    <!doctype html>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="10">
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
