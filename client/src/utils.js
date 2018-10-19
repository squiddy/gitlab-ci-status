export function parseDate(value) {
  return new Date(value.replace(" UTC", "Z"));
}

export function estimateStageOrder(stageBuilds) {
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
