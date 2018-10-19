import React from "react";

import { estimateStageOrder } from "./utils";
import { StatusIcon } from "./StatusIcon";

export function PipelineGraph({ pipeline }) {
  const stages = {};
  pipeline.builds.forEach(build => {
    if (!stages[build.stage]) {
      stages[build.stage] = [];
    }

    stages[build.stage].push(build);
  });

  const orderedStages = estimateStageOrder(stages);

  return (
    <div className="flex -mb-2">
      {orderedStages.map(([stageName, builds]) => {
        return (
          <div className="flex flex-col mr-8 justify-center" key={stageName}>
            {builds.map(b => {
              const navigateToGitLab = () => {
                const url = `http://gitlab.bof.mm.local/${
                  pipeline._raw.project.path_with_namespace
                }/-/jobs/${b.id}`;
                window.open(url, "_blank");
                window.focus();
              };

              return (
                <div className="flex" key={b.id} onClick={navigateToGitLab}>
                  <StatusIcon
                    className="mb-2 mr-1"
                    title={b._raw.name}
                    status={b.status}
                  />
                  <span className="text-xs text-gray-lighter">
                    {b._raw.name}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
