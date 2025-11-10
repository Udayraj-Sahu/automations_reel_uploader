import { NextResponse } from "next/server";
import { uploadReel } from "@/lib/instagram";
import { generateCaption } from "@/lib/ai";
import { updateJob } from "@/lib/sheets";

export async function POST(req) {
	try {
		const { id, videoUrl, title, topic } = await req.json();
		if (!videoUrl) throw new Error("Missing videoUrl");

		// Generate caption
		const caption = await generateCaption(title || "Untitled", topic || "");

		// Upload and publish
		const result = await uploadReel({
			videoUrl,
			caption,
		});

		console.log("✅ Reel published successfully:", result.permalink);

		// ✅ Update Instagram-specific status in Google Sheets
		if (id) {
			await updateJob(id, {
				instagramStatus: "posted",
				instagramPermalink: result.permalink,
				caption,
				mediaId: result.mediaId || "",
			});
		}

		return NextResponse.json({
			success: true,
			caption,
			permalink: result.permalink,
			mediaId: result.mediaId,
		});
	} catch (err) {
		console.error(
			"❌ Publish route error:",
			err.response?.data || err.message
		);

		// ✅ Update Instagram status to failed if something goes wrong
		try {
			const body = await req.json().catch(() => ({}));
			if (body.id)
				await updateJob(body.id, { instagramStatus: "failed" });
		} catch (_) {}

		if (err.message?.includes("Reel published successfully")) {
			return NextResponse.json(
				{
					success: true,
					note: "Reel published but encountered minor error after completion",
				},
				{ status: 200 }
			);
		}

		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
