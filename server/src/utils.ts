import fs from 'fs';

import { State } from './state';

export function restoreState(state: State, filename: string) {
  try {
    const data = JSON.parse(fs.readFileSync(filename, 'utf8'));
    if (data) {
      state.data.builds = new Map(data.builds);
      state.data.pipelines = new Map(data.pipelines);
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
        builds: Array.from(state.data.builds.entries()),
        pipelines: Array.from(state.data.pipelines.entries())
      })
    );
  } catch (err) {
    console.log("Couldn't persist state to disk:", err);
  }
}
