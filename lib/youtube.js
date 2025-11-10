import { google } from "googleapis";
import fs from "fs";
import os from "os";
import path from "path";

/**
 * Upload a YouTube Short directly from a Cloudinary URL or any public video URL
 */
export async function uploadYouTubeShort({ videoUrl, title, description }) {
	try {
		console.log("🎬 Uploading to YouTube...");

		// ✅ Initialize Google OAuth2 client
		const oauth2Client = new google.auth.OAuth2(
			process.env.YOUTUBE_CLIENT_ID,
			process.env.YOUTUBE_CLIENT_SECRET,
			"urn:ietf:wg:oauth:2.0:oob" // safer for backend service use
		);

		oauth2Client.setCredentials({
			refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
		});

		const youtube = google.youtube({ version: "v3", auth: oauth2Client });

		// ✅ Download video temporarily
		const response = await fetch(videoUrl);
		if (!response.ok) throw new Error("Failed to fetch video file");

		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);
		const tmpPath = path.join(os.tmpdir(), `${Date.now()}_short.mp4`);
		fs.writeFileSync(tmpPath, buffer);

		// ✅ Upload to YouTube
		const uploadResponse = await youtube.videos.insert({
			part: ["snippet", "status"],
			requestBody: {
				snippet: {
					title: title || "Untitled Short",
					description:
						description || "Uploaded via Vibecoding Studio ✨",
					categoryId: "22", // People & Blogs
					tags: ["shorts", "vibcoding", "automation"],
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

		// ✅ Cleanup temp file
		fs.unlinkSync(tmpPath);

		// ✅ Return the YouTube Shorts URL
		const videoId = uploadResponse.data.id;
		const youtubeUrl = `https://www.youtube.com/shorts/${videoId}`;

		console.log("✅ YouTube Short uploaded successfully:", youtubeUrl);
		return { videoId, url: youtubeUrl };
	} catch (error) {
		console.error("❌ YouTube upload error:", error.message);
		throw new Error(`YouTube Upload Failed: ${error.message}`);
	}
}
