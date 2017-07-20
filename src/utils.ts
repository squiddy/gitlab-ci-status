import fs = require("fs");

import { State } from "./state";

export function debugRestore(state: State, filename: string) {
  try {
    const data = JSON.parse(fs.readFileSync(filename, "utf8"));
    if (data) {
      state.builds = data.builds;
      state.pipelines = data.pipelines;
    }
  } catch (err) {
    console.log("warning", err);
  }
}

export function debugPersist(state: State, filename: string) {
  try {
    fs.writeFileSync(
      filename,
      JSON.stringify({
        builds: state.builds,
        pipelines: state.pipelines
      })
    );
  } catch (err) {
    console.log("sdsdf", err);
  }
}
