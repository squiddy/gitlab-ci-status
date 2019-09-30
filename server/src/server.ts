import path = require('path');

import express, { Application } from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import compression from 'compression';
import { Patch } from 'immer';

import { State } from './state';
import { persistState, restoreState } from './utils';
import { createWebhookHandler, WebhookBuild, WebhookPipeline } from './webhook';

interface ServerOptions {
  persistPath?: string;
  webhookSecret: string;
  port: number;
}

function createServer(options: ServerOptions): Application {
  const state = new State();
  if (options.persistPath) {
    restoreState(state, options.persistPath);
  }

  const handler = createWebhookHandler(options.webhookSecret, (data: any) => {
    if (data.object_kind === 'build') {
      state.handleBuild(data as WebhookBuild);
    } else if (data.object_kind === 'pipeline') {
      state.handlePipeline(data as WebhookPipeline);
    }

    if (options.persistPath) {
      persistState(state, options.persistPath);
    }
  });

  const app = express();
  app.locals.state = state;

  app.set('etag', false);
  app.use(
    morgan(":date - :remote-addr - ':method :url' :status :response-time ms")
  );
  app.use(compression());

  const publicDir = path.join(__dirname, '../../client/build');
  app.use(express.static(publicDir));
  app.post('/webhook/', bodyParser.json(), handler);
  app.get('/initial', (req, res) => {
    const pipelines = Array.from(state.data.pipelines.values())
      .sort((a, b) => {
        const isSmaller = new Date(a.created_at) < new Date(b.created_at);
        return isSmaller ? 1 : -1;
      })
      .slice(0, 30);

    const data = pipelines.map(p => {
      return Object.assign({}, p, {
        builds: p.builds.map(id => state.data.builds.get(id))
      });
    });

    res.type('json').send(data);
  });
  app.get('/state', (req, res) => {
    res.type('json').send({
      builds: Array.from(state.data.builds.entries()),
      pipelines: Array.from(state.data.pipelines.entries())
    });
  });
  app.get('/stream', (req, res) => {
    const listener = (data: Patch[]) => {
      res.write(`event: update\ndata: ${JSON.stringify(data)}\n\n`);
    };

    state.on('update', listener);
    req.on('close', () => state.off('update', listener));

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });
    res.write('\n');
  });

  return app;
}

export function startServer(options: ServerOptions) {
  const app = createServer(options);
  return app.listen(options.port, (err: string | null) => {
    if (err) {
      console.log(err);
    }

    console.log('Server running ...');
  });
}
