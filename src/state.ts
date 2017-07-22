import fs = require("fs");

import { WebhookBuild, WebhookPipeline } from "./types";

export class State {
  builds: WebhookBuild[];
  pipelines: WebhookPipeline[];

  constructor() {
    this.builds = [];
    this.pipelines = [];
  }

  handleBuild(data: WebhookBuild) {
    let found = false;

    this.builds.forEach((b, idx) => {
      if (b.build_id === data.build_id) {
        this.builds[idx] = data;
        found = true;
      }
    });

    if (!found) {
      this.builds.push(data);
    }
  }

  handlePipeline(data: WebhookPipeline) {
    let found = false;

    this.pipelines.forEach((p, idx) => {
      if (p.object_attributes.id === data.object_attributes.id) {
        this.pipelines[idx] = data;
        found = true;
      }
    });

    if (!found) {
      this.pipelines.push(data);
    }
  }
}
