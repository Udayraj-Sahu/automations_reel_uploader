import { NextResponse } from "next/server";
import { uploadReel } from "@/lib/instagram";
import { generateCaption } from "@/lib/ai";
import { updateJob } from "@/lib/sheets"; // ✅ Add this import

export async function POST(req) {
	try {
		const { id, videoUrl, title, topic } = await req.json(); // ✅ include id
		if (!videoUrl) throw new Error("Missing videoUrl");

		// Generate caption
		const caption = await generateCaption(title || "Untitled", topic || "");

		// Upload and publish
		const result = await uploadReel({
			videoUrl,
			caption,
		});

		console.log("✅ Reel published successfully:", result.permalink);

		// ✅ Update the corresponding job in Google Sheets
		if (id) {
			await updateJob(id, {
				status: "posted",
				permalink: result.permalink,
				caption,
				mediaId: result.mediaId || "",
			});
		}

		// ✅ Return success explicitly
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
