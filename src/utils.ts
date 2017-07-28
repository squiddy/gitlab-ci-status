import fs = require("fs");

import { State } from "./state";

export function restoreState(state: State, filename: string) {
  try {
    const data = JSON.parse(fs.readFileSync(filename, "utf8"));
    if (data) {
      state.builds = data.builds;
      state.pipelines = data.pipelines;
    }
  } catch (err) {
    console.log("Couldn't restore state from disk:", err);
  }
}

export function persistState(state: State, filename: string) {
  try {
    fs.writeFileSync(
      filename,
      JSON.stringify({
        builds: state.builds,
        pipelines: state.pipelines
      })
    );
  } catch (err) {
    console.log("Couldn't persist state to disk:", err);
  }
}
