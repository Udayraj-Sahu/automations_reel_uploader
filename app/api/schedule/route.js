import { NextResponse } from "next/server";
import { listJobs, upsertJob } from "@/lib/sheets";

export async function GET() {
	const jobs = await listJobs();
	return NextResponse.json(jobs);
}

export async function POST(req) {
	const body = await req.json();
	const required = ["id", "videoUrl", "title", "scheduledAt"];
	for (const k of required)
		if (!body[k])
			return NextResponse.json(
				{ error: `Missing ${k}` },
				{ status: 400 }
			);

	const job = {
		id: body.id,

		videoUrl: body.videoUrl,
		title: body.title,
		topic: body.topic || "",
		caption: body.caption || "",
		scheduledAt: body.scheduledAt,
		status: "pending",
		permalink: "",
	};
	await upsertJob(job);
	return NextResponse.json({ ok: true, job });
}
