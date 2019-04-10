import { BuildData, Status } from './types';

export function parseDate(value: string) {
  return new Date(value.replace(' UTC', 'Z'));
}

export function estimateStageOrder(stageBuilds: {
  [index: string]: BuildData[];
}) {
  return Object.entries(stageBuilds).sort(([_, buildsA], [__, buildsB]) => {
    const earliestBuild = (builds: BuildData[]) => {
      // FIXME 2300 is a hack to get a really large date when sorting
      return builds
        .map(
          b => (b.started_at ? parseDate(b.started_at) : new Date(2300, 12, 24))
        )
        .sort()[0];
    };

    const earliestA = earliestBuild(buildsA);
    const earliestB = earliestBuild(buildsB);

    if (earliestA > earliestB) {
      return 1;
    } else if (earliestA < earliestB) {
      return -1;
    } else {
      return 0;
    }
  });
}

export function isPipelineFinished(status: Status) {
  return ![Status.Created, Status.Pending, Status.Running].includes(status);
}
