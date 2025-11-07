import { NextResponse } from "next/server";
import { generateCaption } from "@/lib/ai";

export async function POST(req) {
	try {
		const { title, topic } = await req.json();
		if (!title && !topic) {
			return NextResponse.json(
				{ error: "Missing title or topic" },
				{ status: 400 }
			);
		}

		const caption = await generateCaption({
			influencer: process.env.NEXT_PUBLIC_APP_NAME || "Vibcoding Studio",
			topic: topic || title,
			tone: "friendly, energetic",
			niche: "creator economy",
		});

		return NextResponse.json({ caption });
	} catch (err) {
		console.error("❌ Caption API error:", err);
		return NextResponse.json(
			{ error: err.message || "Failed to generate caption" },
			{ status: 500 }
		);
	}
}
