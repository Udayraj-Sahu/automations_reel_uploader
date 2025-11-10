import { NextResponse } from "next/server";
import { google } from "googleapis";
import { updateJob } from "@/lib/sheets";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(req) {
	try {
		const { id, videoUrl, title, topic } = await req.json();
		if (!videoUrl) throw new Error("Missing videoUrl");

		console.log("🎬 Starting YouTube upload for:", title);

		// ✅ Initialize OAuth2 client
		const oauth2Client = new google.auth.OAuth2(
			process.env.YOUTUBE_CLIENT_ID,
			process.env.YOUTUBE_CLIENT_SECRET,
			"urn:ietf:wg:oauth:2.0:oob"
		);

		oauth2Client.setCredentials({
			refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
		});

		const youtube = google.youtube({
			version: "v3",
			auth: oauth2Client,
		});

		// ✅ Download video temporarily (Cloudinary URL → local temp file)
		const response = await fetch(videoUrl);
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const tmpPath = path.join(os.tmpdir(), `${Date.now()}_upload.mp4`);
		fs.writeFileSync(tmpPath, buffer);

		// ✅ Upload to YouTube
		const uploadResponse = await youtube.videos.insert({
			part: "snippet,status",
			requestBody: {
				snippet: {
					title: title || "Untitled Short",
					description: `#Shorts #${topic || "VibeCoding"}`,
					categoryId: "22", // People & Blogs
					tags: ["shorts", "automation", "VibecodingStudio"],
				},
				status: {
					privacyStatus: "public",
					selfDeclaredMadeForKids: false,
				},
			},
			media: {
				body: fs.createReadStream(tmpPath),
			},
		});

		const videoId = uploadResponse.data.id;
		const youtubeUrl = `https://www.youtube.com/shorts/${videoId}`;

		console.log("✅ YouTube upload successful:", youtubeUrl);

		// ✅ Update YouTube-specific status in Google Sheets
		if (id) {
			await updateJob(id, {
				youtubeStatus: "posted",
				youtubeLink: youtubeUrl,
			});
		}

		// Cleanup
		fs.unlink(tmpPath, () => {});

		return NextResponse.json({
			success: true,
			url: youtubeUrl,
			videoId,
		});
	} catch (error) {
		console.error(
			"❌ YouTube upload error:",
			error.response?.data || error.message
		);

		// ✅ Update YouTube status to failed if something goes wrong
		try {
			const body = await req.json().catch(() => ({}));
			if (body.id) await updateJob(body.id, { youtubeStatus: "failed" });
		} catch (_) {}

		return NextResponse.json({ error: error.message }, { status: 500 });
	}
}
