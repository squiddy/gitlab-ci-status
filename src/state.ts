import { Build, Pipeline, WebhookBuild, WebhookPipeline } from "./types";

export class State {
  pipelines: Map<number, Pipeline>;
  builds: Map<number, Build>;

  constructor() {
    this.pipelines = new Map();
    this.builds = new Map();
  }

  handleBuild(data: WebhookBuild) {
    const entry = {
      id: data.build_id,
      stage: data.build_stage,
      status: data.build_status,
      started_at: data.build_started_at,
      finished_at: data.build_finished_at,
      _raw: data
    };

    this.builds.set(data.build_id, entry);
  }

  handlePipeline(data: WebhookPipeline) {
    const entry = {
      id: data.object_attributes.id,
      ref: data.object_attributes.ref,
      status: data.object_attributes.status,
      created_at: data.object_attributes.created_at,
      finished_at: data.object_attributes.finished_at,
      duration: data.object_attributes.duration,
      user: data.user,
      project: {
        name: data.project.name,
        avatar_url: data.project.avatar_url
      },
      builds: data.builds.map(b => b.id),
      _raw: data
    };

    this.pipelines.set(entry.id, entry);

    data.builds.forEach(build => {
      this.builds.set(build.id, {
        id: build.id,
        stage: build.stage,
        status: build.status,
        started_at: build.started_at,
        finished_at: build.finished_at,
        _raw: build
      });
    });
  }
}
