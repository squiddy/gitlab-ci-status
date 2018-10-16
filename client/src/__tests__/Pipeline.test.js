import React from "react";
import renderer from "react-test-renderer";

import { PipelineGraph } from "../Pipeline";

it("PipelineGraph renders correctly", () => {
  const builds = [
    {
      id: 1,
      stage: "check",
      status: "success",
      _raw: {
        name: "check_code"
      }
    },
    {
      id: 2,
      stage: "test",
      status: "running",
      _raw: {
        name: "test"
      }
    }
  ];
  const tree = renderer.create(<PipelineGraph builds={builds} />).toJSON();
  expect(tree).toMatchSnapshot();
});
