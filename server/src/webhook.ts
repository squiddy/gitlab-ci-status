import { RequestHandler } from 'express';

export interface WebhookPipeline {
  object_attributes: {
    id: number;
    ref: string;
    status: string;
    created_at: string;
    finished_at: string | null;
    duration: number;
  };
  user: any;
  project: {
    name: string;
    avatar_url: string;
  };
  builds: {
    id: number;
    stage: string;
    status: string;
    started_at: string;
    finished_at: string | null;
  }[];
}

export interface WebhookBuild {
  build_id: number;
  build_stage: string;
  build_status: string;
  build_started_at: string | null;
  build_finished_at: string | null;
}

export function createWebhookHandler(
  token: string,
  callback: any
): RequestHandler {
  return (req, res) => {
    if (req.header('x-gitlab-token') !== token) {
      res.status(400).send('invalid token');
    }

    if (!req.body.object_kind) {
      res.status(400).send('invalid payload');
    }

    callback(req.body);
    res.end();
  };
}
