import { startServer } from "./src/server";

startServer({
  port: 3000,
  persistPath: "./appstate.json"
});
