import axios from "axios";

const GRAPH = "https://graph.facebook.com/v19.0";

export async function uploadReel({ videoUrl, caption }) {
	const igUserId = process.env.IG_USER_ID;
	const accessToken = process.env.IG_ACCESS_TOKEN;

	if (!igUserId || !accessToken) {
		throw new Error(
			"Instagram credentials missing (IG_USER_ID or IG_ACCESS_TOKEN)"
		);
	}

	try {
		console.log("🎥 Uploading reel to Instagram...");

		// Step 1: Create media container
		const create = await axios.post(
			`${GRAPH}/${igUserId}/media`,
			{
				media_type: "REELS",
				video_url: videoUrl,
				caption,
			},
			{ params: { access_token: accessToken } }
		);

		const creationId = create.data?.id;
		if (!creationId) throw new Error("No creation_id returned");
		console.log("✅ Created media container:", creationId);

		// Step 2: Poll for readiness
		const maxAttempts = 10;
		const delay = (ms) => new Promise((r) => setTimeout(r, ms));
		let status = "PROCESSING";

		for (let i = 0; i < maxAttempts; i++) {
			const statusCheck = await axios.get(`${GRAPH}/${creationId}`, {
				params: {
					fields: "status_code,status",
					access_token: accessToken,
				},
			});

			status = statusCheck.data?.status_code || "PROCESSING";
			console.log(
				`⏳ Media status: ${status} (attempt ${i + 1}/${maxAttempts})`
			);

			if (status === "FINISHED") break;
			if (status === "ERROR")
				throw new Error("Instagram processing failed");

			await delay(5000); // wait 5 sec before checking again
		}

		if (status !== "FINISHED") {
			throw new Error(
				"Timeout: Media not ready for publishing after polling"
			);
		}

		// Step 3: Publish the ready media
		const publish = await axios.post(
			`${GRAPH}/${igUserId}/media_publish`,
			{ creation_id: creationId },
			{ params: { access_token: accessToken } }
		);

		const mediaId = publish.data?.id;
		if (!mediaId) throw new Error("No media_id returned on publish");

		const { data } = await axios.get(`${GRAPH}/${mediaId}`, {
			params: { fields: "permalink", access_token: accessToken },
		});

		console.log("✅ Reel published successfully:", data?.permalink);
		return { mediaId, permalink: data?.permalink };
	} catch (err) {
		console.error(
			"❌ Instagram upload failed:",
			err.response?.data || err.message
		);
		throw err;
	}
}
