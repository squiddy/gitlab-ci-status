import { State } from "../src/state";
import { Status } from "../src/types";

const buildData = {
  object_kind: "build",
  ref: "master",
  build_id: 123,
  build_name: "test",
  build_stage: "test",
  build_started_at: "2017",
  build_status: "running" as Status,
  repository: {
    name: "test"
  },
  user: {
    name: "test"
  }
};

const pipelineData = {
  object_kind: "pipeline",
  object_attributes: {
    id: 123,
    status: "running" as Status,
    created_at: "2017",
    ref: "master"
  },
  project: {
    name: "test"
  },
  user: {
    name: "test"
  },
  builds: [
    {
      id: 123,
      status: "created"
    }
  ]
};

test("State can be constructed", () => {
  const state = new State();
  expect(state.pipelines).toHaveLength(0);
});

test("State can handle updating builds", () => {
  const state = new State();
  state.pipelines = [pipelineData];
  expect(state.pipelines[0].builds[0].status).toBe("created");

  state.handleBuild(buildData);
  expect(state.pipelines[0].builds[0].status).toBe("running");
});

test("State can handle new pipelines", () => {
  const state = new State();
  state.handlePipeline(pipelineData);
  expect(state.pipelines).toHaveLength(1);
  expect(state.pipelines[0].object_attributes.id).toBe(123);
});

test("State can handle updating pipelines", () => {
  const state = new State();
  state.handlePipeline(pipelineData);
  expect(state.pipelines).toHaveLength(1);
  expect(state.pipelines[0].object_attributes.status).toBe("running");

  const data = Object.assign({}, pipelineData);
  data.object_attributes.status = "failed";
  state.handlePipeline(data);
  expect(state.pipelines).toHaveLength(1);
  expect(state.pipelines[0].object_attributes.status).toBe("failed");
});
