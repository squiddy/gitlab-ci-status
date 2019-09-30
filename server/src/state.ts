import { EventEmitter } from 'events';

import { produce } from 'immer';

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

interface StateData {
  pipelines: Map<number, PipelineState>;
  builds: Map<number, BuildState>;
}

export class State extends EventEmitter {
  data: StateData;

  constructor() {
    super();

    this.data = {
      pipelines: new Map(),
      builds: new Map()
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

    this.data = produce(
      this.data,
      draft => {
        draft.builds.set(data.build_id, entry);
      },
      patches => {
        this.emit('update', patches);
      }
    );
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

    this.data = produce(
      this.data,
      draft => {
        draft.pipelines.set(entry.id, entry);
        data.builds.forEach(build => {
          draft.builds.set(build.id, {
            id: build.id,
            stage: build.stage,
            status: build.status,
            started_at: build.started_at,
            finished_at: build.finished_at,
            _raw: build
          });
        });
      },
      patches => {
        this.emit('update', patches);
      }
    );
  }
}
