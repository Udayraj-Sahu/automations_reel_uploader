import "dotenv/config";
import { listJobs, updateJob } from "../lib/sheets.js";
import { generateCaption } from "../lib/ai.js";
import { uploadReel } from "../lib/instagram.js";
import { notify } from "../lib/notify.js";

async function tick() {
	const now = new Date();
	const jobs = await listJobs();
	const due = jobs.filter(
		(j) => j.status === "pending" && new Date(j.scheduledAt) <= now
	);
	for (const job of due) {
		try {
			const caption = job.caption?.trim()
				? job.caption
				: await generateCaption({
						influencer: job.influencer,
						topic: job.topic || job.title,
				  });
			const { permalink } = await uploadReel({
				videoUrl: job.videoUrl,
				caption,
			});
			await updateJob(job.id, { status: "posted", caption, permalink });
			await notify(`✅ (Worker) Reel posted: ${job.title}`);
			console.log("Posted:", job.id);
		} catch (e) {
			await updateJob(job.id, { status: "failed" });
			console.error("Failed", job.id, e.message);
		}
	}
}

(async function main() {
	console.log("Vibcoding Worker running...");
	setInterval(tick, 60_000 * 5); // every 5 minutes
	await tick();
})();
