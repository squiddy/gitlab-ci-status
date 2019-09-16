import React, { useState } from 'react';

import { Avatar } from './Avatar';
import { StatusIcon } from './StatusIcon';
import { Duration } from './Duration';
import { parseDate, isPipelineFinished } from './utils';
import { PipelineGraph } from './PipelineGraph';
import { BuildData, PipelineData, Status } from './types';

export function getTotalBuildRunTimeMs(builds: BuildData[]): number {
  return builds.reduce((sum, b) => {
    if (!b.started_at) {
      return sum;
    }

    const start = parseDate(b.started_at);

    if (!b.finished_at) {
      return sum + (new Date().getTime() - start.getTime()) / 1000;
    }

    const finish = parseDate(b.finished_at);
    return sum + (finish.getTime() - start.getTime()) / 1000;
  }, 0);
}

export function getRealDuration(pipeline: PipelineData): number | null {
  const data = pipeline._raw.object_attributes;
  if (!data.created_at || !data.finished_at) {
    return null;
  }

  return (
    parseDate(data.finished_at).getTime() / 1000 -
    parseDate(data.created_at).getTime() / 1000
  );
}

export function Pipeline({ pipeline }: { pipeline: PipelineData }) {
  const [showDetails, setShowDetails] = useState(
    !isPipelineFinished(pipeline.status) || pipeline.status === 'failed'
  );

  const duration = getTotalBuildRunTimeMs(pipeline.builds);
  const realDuration = getRealDuration(pipeline);

  const navigateToGitLab = () => {
    const url = `http://gitlab.bof.mm.local/${pipeline._raw.project.path_with_namespace}/pipelines/${pipeline.id}`;
    window.open(url, '_blank');
    window.focus();
  };

  const isMainRepository =
    pipeline._raw.project.namespace !== pipeline._raw.user.username;

  return (
    <div
      className={`flex flex-col mb-8 rounded cursor-pointer ${
        isMainRepository ? 'main-repository' : ''
      }`}
    >
      <div
        className="flex flex-row justify-between items-center bg-white rounded-t"
        onClick={navigateToGitLab}
      >
        <div className="p-4 flex-initial w-48">
          <Avatar className="h-16 rounded-full m-1" obj={pipeline.project} />
          <Avatar className="h-16 rounded-full m-1" obj={pipeline.user} />
        </div>
        <div className="flex-1 px-6 py-4">
          <div className="font-bold text-xl mb-1">{pipeline.project.name}</div>
          <p className="text-grey-darker text-base mb-2">{pipeline.ref}</p>
          <small className="text-grey-dark text-sm">
            {pipeline._raw.commit.message}
          </small>
        </div>
        <div className="p-4 flex-initial flex items-center">
          <StatusIcon className="h-12 w-12" status={pipeline.status} />
        </div>
      </div>
      <div
        className={'flex flex-col bg-indigo-darker rounded-b text-grey'}
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails && (
          <div className="border-b border-dotted border-indigo-darkest px-4 py-4">
            <PipelineGraph pipeline={pipeline} />
          </div>
        )}
        <div className="flex justify-between items-center w-full px-4 py-2">
          <div className="text-xs">
            {realDuration ? (
              <>
                took <Duration value={realDuration} /> (
                <Duration value={duration} />)
              </>
            ) : (
              pipeline.status !== Status.Skipped &&
              pipeline.status !== Status.Canceled && (
                <>
                  running for <Duration value={duration} ticking />
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
