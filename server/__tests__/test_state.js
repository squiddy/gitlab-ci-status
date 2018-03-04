const { State } = require("../src/state");

const pipelineData = {
  object_attributes: {
    id: 5
  },
  project: {
    name: "test-project"
  },
  builds: [
    {
      id: 2
    },
    {
      id: 6
    }
  ]
};

test("State can be constructed", () => {
  const state = new State();
  expect(state.builds.size).toEqual(0);
  expect(state.pipelines.size).toEqual(0);
});

test("State can handle new pipelines", () => {
  const state = new State();
  state.handlePipeline(pipelineData);

  expect(state.pipelines.size).toEqual(1);
  expect(state.pipelines.get(5).id).toEqual(5);
  expect(state.pipelines.get(5).builds).toEqual([2, 6]);
  expect(state.pipelines.get(5)._raw).toEqual(pipelineData);
  expect(state.builds.size).toEqual(2);
});

test("State can handle updating pipelines", () => {
  const state = new State();
  state.handlePipeline(pipelineData);

  const data = Object.assign({}, pipelineData);
  data.object_attributes.status = "success";
  state.handlePipeline(data);

  expect(state.pipelines.size).toEqual(1);
  expect(state.pipelines.get(5).status).toBe("success");
});

test("State can handle updating builds", () => {
  const state = new State();
  state.handlePipeline(
    Object.assign(pipelineData, {
      builds: [
        {
          id: 2,
          status: "created"
        },
        {
          id: 6,
          status: "created"
        }
      ]
    })
  );
  expect(state.builds.get(2).status).toEqual("created");
  expect(state.builds.get(6).status).toEqual("created");

  state.handleBuild({
    build_id: 6,
    build_status: "success"
  });
  expect(state.builds.get(2).status).toEqual("created");
  expect(state.builds.get(6).status).toEqual("success");
});
