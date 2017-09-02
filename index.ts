import { startServer } from "./src/server";

startServer({
  port: Number(process.env.APP_PORT) || 3000,
  persistPath: process.env.APP_STATE_FILE_PATH
});
