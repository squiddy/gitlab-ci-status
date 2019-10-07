import { WebhookBuild, WebhookPipeline } from './webhook';

interface PipelineState {
  id: number;
  created_at: string;
  builds: number[];
  status: string;
  _raw: any;
}

interface BuildState {
  id: number;
  stage: string;
  status: string;
  started_at: string | null;
  finished_at: string | null;
  _raw: any;
}

export class State {
  pipelines: Map<number, PipelineState>;
  builds: Map<number, BuildState>;

  constructor() {
    this.pipelines = new Map();
    this.builds = new Map();
  }

  load(data: any) {
    this.builds = new Map(data.builds);
    this.pipelines = new Map(data.pipelines);
  }

  dump() {
    return {
      builds: Array.from(this.builds.entries()),
      pipelines: Array.from(this.pipelines.entries())
    };
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
