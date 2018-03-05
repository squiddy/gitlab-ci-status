const fs = require("fs");

const { State } = require("./state");

function restoreState(state, filename) {
  try {
    const data = JSON.parse(fs.readFileSync(filename, "utf8"));
    if (data) {
      state.builds = new Map(data.builds);
      state.pipelines = new Map(data.pipelines);
    }
  } catch (err) {
    console.log("Couldn't restore state from disk:", err);
  }
}

function persistState(state, filename) {
  try {
    fs.writeFileSync(
      filename,
      JSON.stringify({
        builds: Array.from(state.builds.entries()),
        pipelines: Array.from(state.pipelines.entries())
      })
    );
  } catch (err) {
    console.log("Couldn't persist state to disk:", err);
  }
}

module.exports = {
  restoreState,
  persistState
};
