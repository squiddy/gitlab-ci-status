import React from "react";
import renderer from "react-test-renderer";

import { PipelineGraph } from "../Pipeline";

it("PipelineGraph renders correctly", () => {
  const builds = [
    {
      stage: "check",
      status: "success"
    },
    {
      stage: "test",
      status: "running"
    }
  ];
  const tree = renderer.create(<PipelineGraph builds={builds} />).toJSON();
  expect(tree).toMatchSnapshot();
});
