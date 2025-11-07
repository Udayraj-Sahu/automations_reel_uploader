import { NextResponse } from "next/server";
import { cleanupOldVideos } from "@/lib/cleanup";

export async function GET() {
	try {
		await cleanupOldVideos(7);
		return NextResponse.json({ success: true });
	} catch (err) {
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
