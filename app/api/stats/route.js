import { NextResponse } from "next/server";
import { listJobs } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const jobs = await listJobs();
		const total = jobs.length;
		const published = jobs.filter((j) => j.status === "posted").length;
		const scheduled = jobs.filter(
			(j) => j.status === "pending" || j.status === "scheduled"
		).length;
		const avgEngagement = jobs.length ? "24.5K" : "0"; // placeholder

		return NextResponse.json({
			total,
			published,
			scheduled,
			avgEngagement,
		});
	} catch (err) {
		console.error("❌ Stats API error:", err.message);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
