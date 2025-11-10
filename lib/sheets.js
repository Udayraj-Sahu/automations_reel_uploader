import fs from "fs";
import path from "path";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_ID = process.env.SHEET_ID;
const RANGE = "Sheet1!A2:M";

function getAuth() {
	let creds = null;
	try {
		if (process.env.GOOGLE_CREDS_JSON) {
			const raw = process.env.GOOGLE_CREDS_JSON.trim();
			creds = raw.startsWith("{")
				? JSON.parse(raw)
				: JSON.parse(JSON.parse(raw));
		}
	} catch (err) {
		console.warn("⚠️ Failed to parse GOOGLE_CREDS_JSON:", err.message);
	}

	if (!creds) {
		const filePath = path.resolve(process.cwd(), "service-account.json");
		if (!fs.existsSync(filePath))
			throw new Error("❌ Missing Google credentials");
		creds = JSON.parse(fs.readFileSync(filePath, "utf8"));
	}

	return new google.auth.GoogleAuth({ credentials: creds, scopes: SCOPES });
}

export async function listJobs() {
	const sheets = google.sheets({ version: "v4", auth: getAuth() });
	const res = await sheets.spreadsheets.values.get({
		spreadsheetId: SHEET_ID,
		range: RANGE,
	});
	const rows = res.data.values || [];

	const headers = [
		"id",
		"videoUrl",
		"title",
		"topic",
		"caption",
		"scheduledAt",
		"instagramStatus",
		"instagramPermalink",
		"youtubeStatus",
		"youtubeLink",
		"views",
		"likes",
		"comments",
	];

	return rows.map((r) =>
		Object.fromEntries(headers.map((h, i) => [h, r[i] || ""]))
	);
}

export async function upsertJob(job) {
	const sheets = google.sheets({ version: "v4", auth: getAuth() });
	const jobs = await listJobs();
	const idx = jobs.findIndex((j) => j.id === job.id);

	const row = [
		job.id,
		job.videoUrl,
		job.title,
		job.topic,
		job.caption,
		job.scheduledAt,
		job.instagramStatus || "pending",
		job.instagramPermalink || "",
		job.youtubeStatus || "pending",
		job.youtubeLink || "",
		job.views || "",
		job.likes || "",
		job.comments || "",
	];

	const rowNum = idx === -1 ? jobs.length + 2 : idx + 2;
	const range = `Sheet1!A${rowNum}:M${rowNum}`;

	await sheets.spreadsheets.values.update({
		spreadsheetId: SHEET_ID,
		range,
		valueInputOption: "USER_ENTERED",
		requestBody: { values: [row] },
	});
}

export async function updateJob(id, updates) {
	const jobs = await listJobs();
	const found = jobs.find((j) => j.id === id);
	if (!found) {
		console.warn(`⚠️ No job found for ID: ${id}`);
		return;
	}

	// Merge with defaults
	const updated = {
		instagramStatus: found.instagramStatus || "pending",
		youtubeStatus: found.youtubeStatus || "pending",
		...found,
		...updates,
	};

	await upsertJob(updated);
}
