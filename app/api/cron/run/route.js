import { NextResponse } from "next/server";
import { listJobs, updateJob } from "@/lib/sheets";
import { generateCaption } from "@/lib/ai";
import { uploadReel } from "@/lib/instagram";
import { notify } from "@/lib/notify";

export const dynamic = "force-dynamic"; // Ensures fresh data on every call

export async function GET() {
	const now = new Date();
	console.log("🕐 Cron Trigger:", now.toISOString());

	try {
		const jobs = await listJobs();
		if (!Array.isArray(jobs) || jobs.length === 0) {
			console.log("📄 No jobs found in Google Sheet.");
			return NextResponse.json({
				ok: true,
				message: "No jobs available.",
				ranAt: now.toISOString(),
				processed: 0,
			});
		}

		// 1️⃣ Filter jobs that are due
		const due = jobs.filter(
			(j) =>
				(j.status === "pending" || j.status === "scheduled") &&
				j.scheduledAt &&
				new Date(j.scheduledAt).getTime() <= now.getTime()
		);

		if (!due.length) {
			console.log("⏰ No reels due for publishing right now.");
			return NextResponse.json({
				ok: true,
				message: "No due jobs at this time.",
				ranAt: now.toISOString(),
				processed: 0,
			});
		}

		console.log(`🚀 Found ${due.length} scheduled reel(s) ready to post.`);

		const results = [];

		// 2️⃣ Process each job sequentially (avoids Instagram rate limit)
		for (const job of due) {
			console.log(`🎬 Processing: ${job.title || job.id}`);

			try {
				// Mark as publishing early (prevents duplicate runs)
				await updateJob(job.id, { status: "publishing" });

				// Generate caption if missing
				const caption = job.caption?.trim()
					? job.caption
					: await generateCaption({
							influencer: job.influencer || "Creator",
							topic: job.topic || job.title || "Reel",
					  });

				// Upload reel to Instagram
				const { permalink, mediaId } = await uploadReel({
					videoUrl: job.videoUrl,
					caption,
				});

				// Update sheet with success
				await updateJob(job.id, {
					status: "posted",
					caption,
					permalink,
					mediaId,
					postedAt: new Date().toISOString(),
				});

				// Optional: send notification
				await notify(`✅ (Cron) Reel posted: ${job.title || job.id}`);

				console.log(`✅ Published ${job.id}: ${permalink}`);
				results.push({ id: job.id, ok: true, permalink });
			} catch (err) {
				console.error(`❌ Failed to publish ${job.id}:`, err.message);
				await updateJob(job.id, {
					status: "failed",
					error: err.message,
				});
				results.push({ id: job.id, ok: false, error: err.message });

				// Notify of failure (optional)
				await notify(
					`⚠️ (Cron) Failed to post: ${job.title || job.id}`
				);
			}
		}

		console.log(`🎉 Cron cycle complete. ${results.length} processed.`);

		return NextResponse.json({
			ok: true,
			ranAt: now.toISOString(),
			processed: results.length,
			results,
		});
	} catch (err) {
		console.error("💥 Cron execution error:", err.message);
		await notify(`❌ (Cron) Fatal error: ${err.message}`);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
