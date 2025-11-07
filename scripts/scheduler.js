import cron from "node-cron";
import fetch from "node-fetch";

cron.schedule("*/5 * * * *", async () => {
	console.log("🕐 Running local cron...");
	await fetch("http://localhost:3000/api/cron/run");
});
