import { startServer } from "./server";

if (!process.env.APP_WEBHOOK_SECRET) {
  console.error("Setting APP_WEBHOOK_SECRET not specified. Aborting.");
  process.exit(1);
}

const server = startServer({
  port: Number(process.env.APP_PORT) || 4000,
  persistPath: process.env.APP_STATE_FILE_PATH,
  webhookSecret: process.env.APP_WEBHOOK_SECRET!
});

const shutdown = () => {
  console.log("Shutdown requested ...");
  process.exit();
};

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);