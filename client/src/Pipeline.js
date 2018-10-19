import React from "react";

import { Avatar } from "./Avatar";
import { StatusIcon } from "./StatusIcon";

function parseDate(value) {
  return new Date(value.replace(" UTC", "Z"));
}

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

class Duration extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: Math.floor(props.value), lastUpdate: null };
    this.counter = null;
  }

  componentDidMount() {
    if (this.props.ticking) {
      this.setState(state => ({
        lastUpdate: Date.now()
      }));
      this.counter = setInterval(this.tick.bind(this), 1000);
    }
  }

  tick() {
    this.setState(state => {
      const now = Date.now();
      const diff = Math.floor((Date.now() - state.lastUpdate) / 1000);
      return {
        value: state.value + diff,
        lastUpdate: now
      };
    });
  }

  componentWillUnmount() {
    if (this.counter) {
      clearInterval(this.counter);
    }
  }

  render() {
    return (
      <>
        {Math.floor(this.state.value / 60)}m {this.state.value % 60}s
      </>
    );
  }
}

export class Pipeline extends React.Component {
  constructor(props) {
    super(props);

    this.state = { showDetails: false };
    this.toggleDetails = this.toggleDetails.bind(this);
  }

  toggleDetails() {
    this.setState(state => ({ showDetails: !state.showDetails }));
  }

  render() {
    const { pipeline } = this.props;
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
            <div className="font-bold text-xl mb-2">
              {pipeline.project.name}
            </div>
            <p className="text-grey-darker text-base">{pipeline.ref}</p>
          </div>
          <div className="p-4 flex-initial flex items-center">
            <StatusIcon className="h-12" status={pipeline.status} />
          </div>
        </div>
        <div
          className={"flex flex-col bg-indigo-darker rounded-b text-grey"}
          onClick={this.toggleDetails}
        >
          <div className="flex justify-between items-center w-full px-4 py-2">
            <div className="pipeline-duration">
              {isFinished ? "took" : "running for"}{" "}
              <Duration value={duration} ticking={!isFinished} />
            </div>
            {!this.state.showDetails && (
              <PipelineGraph pipeline={pipeline} builds={pipeline.builds} />
            )}
          </div>
          {this.state.showDetails && (
            <div className="border-t border-dotted border-indigo-darkest px-4 py-4">
              <PipelineStuff pipeline={pipeline} />
            </div>
          )}
        </div>
      </div>
    );
  }
}

function estimateStageOrder(stageBuilds) {
  return Object.entries(stageBuilds).sort(([_, buildsA], [__, buildsB]) => {
    const earliestBuild = builds => {
      // FIXME 2300 is a hack to get a really large date when sorting
      return builds
        .map(
          b => (b.started_at ? parseDate(b.started_at) : new Date(2300, 12, 24))
        )
        .sort()[0];
    };
    return earliestBuild(buildsA) > earliestBuild(buildsB);
  });
}

function PipelineStuff({ pipeline }) {
  const stages = {};
  pipeline._raw.builds.forEach(build => {
    if (!stages[build.stage]) {
      stages[build.stage] = [];
    }

    stages[build.stage].push(build);
  });

  const orderedStages = estimateStageOrder(stages);

  return (
    <div className="flex">
      {orderedStages.map(([stageName, builds]) => {
        return (
          <div className="flex flex-col mr-8 justify-center" key={stageName}>
            {builds.map(b => {
              return (
                <div className="flex" key={b.id}>
                  <StatusIcon
                    className="mb-2 mr-1"
                    title={b.name}
                    status={b.status}
                  />
                  <span className="text-xs text-gray-lighter">{b.name}</span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

export function PipelineGraph({ pipeline, builds }) {
  return (
    <div className="flex items-center">
      {builds.filter(b => b).map(b => {
        const navigateToGitLab = () => {
          const url = `http://gitlab.bof.mm.local/${
            pipeline._raw.project.path_with_namespace
          }/-/jobs/${b.id}`;
          window.open(url, "_blank");
          window.focus();
        };

        return (
          <StatusIcon
            key={b.id}
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
