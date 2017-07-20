import { createServer } from "./src/server";

createServer({
  port: 3000,
  persistPath: "./appstate.json"
});
