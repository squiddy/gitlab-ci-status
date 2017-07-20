export interface Options {
  port: number;
  persistPath: string;
}

export type Status = "failed" | "success" | "skipped" | "running" | "created";

export interface WebhookBuild {
  object_kind: string;
  ref: string;
  build_id: number;
  build_name: string;
  build_stage: string;
  build_status: Status;
  build_started_at: string;
  repository: {
    name: string;
  };
  user: {
    name: string;
  };
}

export interface WebhookPipeline {
  object_kind: string;
  object_attributes: {
    id: number;
    status: Status;
    created_at: string;
    ref: string;
  };
  user: {
    name: string;
    avatar_url?: string;
  };
  project: {
    name: string;
    avatar_url?: string;
  };
}

export type WebhookData = WebhookBuild | WebhookPipeline;

export interface WebhookHandler {
  (data: WebhookBuild | WebhookPipeline): void;
}
