import { State } from "../src/state";

const buildData = {
  object_kind: "build",
  build_id: 123,
  build_name: "test",
  build_stage: "test",
  build_started_at: "2017",
  build_status: "running"
};

const pipelineData = {
  object_kind: "pipeline",
  object_attributes: {
    id: 123,
    status: "running",
    created_at: "2017"
  }
};

test("State can be constructed", () => {
  const state = new State();
  expect(state.builds).toHaveLength(0);
  expect(state.pipelines).toHaveLength(0);
});

test("State can handle new builds", () => {
  const state = new State();
  state.handleBuild(buildData);
  expect(state.builds).toHaveLength(1);
  expect(state.builds[0].build_id).toBe(123);
});

test("State can handle updating builds", () => {
  const state = new State();
  state.handleBuild(buildData);
  expect(state.builds).toHaveLength(1);
  expect(state.builds[0].build_status).toBe("running");

  state.handleBuild({ ...buildData, build_status: "success" });
  expect(state.builds).toHaveLength(1);
  expect(state.builds[0].build_status).toBe("success");
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
