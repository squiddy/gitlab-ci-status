import { startServer } from "./src/server";

const server = startServer({
  port: Number(process.env.APP_PORT) || 3000,
  persistPath: process.env.APP_STATE_FILE_PATH
});

const shutdown = () => {
  console.log("Shutdown requested ...");
  process.exit();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
