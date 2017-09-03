export interface Options {
  webhookSecret: string;
  port: number;
  persistPath?: string;
}

export type Status = "failed" | "success" | "skipped" | "running" | "created";

export interface WebhookBuild {
  object_kind: "build";
  ref: string;
  tag: boolean;
  sha: string;
  before_sha: string;
  build_id: number;
  build_name: string;
  build_stage: string;
  build_status: Status;
  build_started_at: string;
  build_finished_at?: string;
  build_duration?: number;
  build_allow_failure: boolean;
  project_id: number;
  project_name: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  commit: {
    id: 15451;
    sha: string;
    message: string;
    author_name: string;
    author_email: string;
    author_url: string;
    status: Status;
    duration?: number;
    started_at: number;
    finished_at?: string;
  };
  repository: {
    name: string;
    url: string;
    description: string;
    homepage: string;
    git_http_url: string;
    git_ssh_url: string;
    visibility_level: number;
  };
}

export interface Avatar {
  avatar_url?: string;
}

export interface User extends Avatar {
  name: string;
  username: string;
}

export interface WebhookPipelineBuild {
  id: number;
  stage: string;
  name: string;
  status: Status;
  created_at: string;
  started_at: string;
  finished_at: string;
  when: string;
  manual: boolean;
  user: User;
  runner: {
    id: number;
    description: string;
    active: boolean;
    is_shared: boolean;
  };
  artifacts_file: {
    filename?: string;
    size?: number;
  };
}

export interface WebhookPipeline {
  object_kind: "pipeline";
  object_attributes: {
    id: number;
    ref: string;
    tag: boolean;
    sha: string;
    before_sha: string;
    status: Status;
    stages: string[];
    created_at: string;
    finished_at?: string;
    duration?: number;
  };
  user: User;
  project: Avatar & {
    name: string;
    description: string;
    web_url: string;
    git_ssh_url: string;
    git_http_url: string;
    namespace: string;
    visibility_level: number;
    path_with_namespace: string;
    default_branch: string;
    ci_config_path?: string;
  };
  commit: {
    id: string;
    message: string;
    timestamp: string;
    url: string;
    author: {
      name: string;
      email: string;
    };
  };
  builds: WebhookPipelineBuild[];
}

export type WebhookData = WebhookBuild | WebhookPipeline;

export type WebhookHandler = (data: WebhookData) => void;
