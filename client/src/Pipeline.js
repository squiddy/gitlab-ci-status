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

  const isMainRepository =
    pipeline._raw.project.namespace !== pipeline._raw.user.username;

  return (
    <div
      className={`flex flex-col my-8 rounded cursor-pointer ${
        isMainRepository ? "main-repository" : ""
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
          <div className="font-bold text-xl mb-2">{pipeline.project.name}</div>
          <p className="text-grey-darker text-base">{pipeline.ref}</p>
        </div>
        <div className="p-4 flex-initial flex items-center">
          <StatusIcon className="h-12" status={pipeline.status} />
        </div>
      </div>
      <div className="flex justify-between items-center bg-indigo-darker rounded-b px-4 py-2 text-grey">
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
    <div className="flex items-center">
      {builds.filter(b => b).map((b, idx) => {
        const navigateToGitLab = () => {
          const url = `http://gitlab.bof.mm.local/${
            pipeline._raw.project.path_with_namespace
          }/-/jobs/${b.id}`;
          window.open(url, "_blank");
          window.focus();
        };

        return (
          <StatusIcon
            key={idx}
            className="mx-1"
            style={{ height: "1.3rem" }}
            onClick={navigateToGitLab}
            title={b._raw.name}
            status={b.status}
          />
        );
      })}
    </div>
  );
}
