export enum Status {
  Failed = 'failed',
  Success = 'success',
  Skipped = 'skipped',
  Canceled = 'canceled',
  Running = 'running',
  Created = 'created',
  Pending = 'pending',
  Manual = 'manual'
}

export interface BuildData {
  started_at?: string;
  finished_at?: string;
  stage: string;
  id: number;
  _raw: {
    name: string;
  };
  status: Status;
}

interface Project {
  name: string;
  avatar_url: string | null;
}

interface User {
  avatar_url: string | null;
  name: string;
}

export interface PipelineData {
  id: number;
  builds: BuildData[];
  status: Status;
  project: Project;
  user: User;
  ref: string;

  _raw: {
    user: {
      username: string;
    };
    project: {
      namespace: string;
      path_with_namespace: string;
    };
  };
}
