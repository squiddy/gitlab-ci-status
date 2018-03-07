import React from "react";

import { Avatar } from "./Avatar";
import { StatusIcon } from "./StatusIcon";

export function getTotalBuildRunTimeMs(builds) {
  return builds.reduce((sum, b) => {
    if (!b.started_at) {
      return sum;
    }

    const start = new Date(b.started_at.slice(0, -4));

    if (!b.finished_at) {
      return sum + (new Date() - start) / 1000;
    }

    const finish = new Date(b.finished_at.slice(0, -4));
    return sum + (finish - start) / 1000;
  }, 0);
}

export function Pipeline({ pipeline }) {
  const duration = getTotalBuildRunTimeMs(pipeline.builds);
  const isFinished = !["created", "pending", "running"].includes(
    pipeline.status
  );

  const navigateToGitLab = () => {
    const url = `http://gitlab.bof.mm.local/${
      pipeline._raw.project.path_with_namespace
    }/pipelines/${pipeline.id}`;
    window.open(url, "_blank");
    window.focus();
  };

  return (
    <div className={`queue-entry`}>
      <div className="queue-entry-body" onClick={navigateToGitLab}>
        <div className="avatars">
          <Avatar obj={pipeline.user} />
          <Avatar obj={pipeline.project} />
        </div>
        <div className="info">
          <strong>{pipeline.project.name}</strong>
          {pipeline.ref}
        </div>
        <div className={`status-info status-${pipeline.status}`}>
          {pipeline.status}
          <StatusIcon status={pipeline.status} />
        </div>
      </div>
      <div className="queue-entry-footer">
        <div className="pipeline-duration">
          {isFinished ? "took" : "running for"} {Math.floor(duration / 60)}m{" "}
          {duration % 60}s
        </div>
        <PipelineGraph pipeline={pipeline} builds={pipeline.builds} />
      </div>
    </div>
  );
}

export function PipelineGraph({ pipeline, builds }) {
  return (
    <ul className="pipeline-graph">
      {builds.filter(b => b).map((b, idx) => {
        const navigateToGitLab = () => {
          const url = `http://gitlab.bof.mm.local/${
            pipeline._raw.project.path_with_namespace
          }/-/jobs/${b.id}`;
          window.open(url, "_blank");
          window.focus();
        };

        return (
          <li key={idx} className="pipeline-graph-job" onClick={navigateToGitLab}>
            <StatusIcon title={b._raw.name} status={b.status} />
          </li>
        );
      })}
    </ul>
  );
}
