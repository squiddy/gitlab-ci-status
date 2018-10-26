import React from "react";

import { Avatar } from "./Avatar";
import { StatusIcon } from "./StatusIcon";
import { Duration } from "./Duration";
import { parseDate, isPipelineFinished } from "./utils";
import { PipelineGraph } from "./PipelineGraph";

export function getTotalBuildRunTimeMs(builds) {
  return builds.reduce((sum, b) => {
    if (!b.started_at) {
      return sum;
    }

    const start = parseDate(b.started_at);

    if (!b.finished_at) {
      return sum + (new Date() - start) / 1000;
    }

    const finish = parseDate(b.finished_at);
    return sum + (finish - start) / 1000;
  }, 0);
}

export class Pipeline extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showDetails:
        !isPipelineFinished(props.pipeline.status) ||
        props.pipeline.status === "failed"
    };
    this.toggleDetails = this.toggleDetails.bind(this);
  }

  toggleDetails() {
    this.setState(state => ({ showDetails: !state.showDetails }));
  }

  render() {
    const { pipeline } = this.props;
    const duration = getTotalBuildRunTimeMs(pipeline.builds);

    const navigateToGitLab = () => {
      const url = `http://gitlab.bof.mm.local/${
        pipeline._raw.project.path_with_namespace
      }/pipelines/${pipeline.id}`;
      window.open(url, "_blank");
      window.focus();
    };

    const isMainRepository =
      pipeline._raw.project.namespace !== pipeline._raw.user.username;

    const isFinished = isPipelineFinished(pipeline.status);

    return (
      <div
        className={`flex flex-col mb-8 rounded cursor-pointer ${
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
            <div className="font-bold text-xl mb-2">
              {pipeline.project.name}
            </div>
            <p className="text-grey-darker text-base">{pipeline.ref}</p>
          </div>
          <div className="p-4 flex-initial flex items-center">
            <StatusIcon className="h-12 w-12" status={pipeline.status} />
          </div>
        </div>
        <div
          className={"flex flex-col bg-indigo-darker rounded-b text-grey"}
          onClick={this.toggleDetails}
        >
          {this.state.showDetails && (
            <div className="border-b border-dotted border-indigo-darkest px-4 py-4">
              <PipelineGraph pipeline={pipeline} />
            </div>
          )}
          <div className="flex justify-between items-center w-full px-4 py-2">
            <div className="text-xs">
              {isFinished ? "took" : "running for"}{" "}
              <Duration value={duration} ticking={!isFinished} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
