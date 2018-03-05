import React from "react";
import renderer from "react-test-renderer";

import { PipelineGraph } from "../Pipeline";

it("PipelineGraph renders correctly", () => {
  const builds = [
    {
      stage: "check",
      status: "success",
      _raw: {
        name: "check_code"
      }
    },
    {
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
