import React from "react";
import renderer from "react-test-renderer";

import { StatusIcon } from "../StatusIcon";

it("StatusIcon renders correctly", () => {
  const tree = renderer
    .create(<StatusIcon status="failed" title="Failed" />)
    .toJSON();
  expect(tree).toMatchSnapshot();
});
