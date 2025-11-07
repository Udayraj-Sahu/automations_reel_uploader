import fs from "fs";
import path from "path";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const SHEET_ID = process.env.SHEET_ID;
const RANGE = "Sheet1!A2:L";

function getAuth() {
	let creds = null;

	try {
		// Try parsing from .env variable
		if (process.env.GOOGLE_CREDS_JSON) {
			const raw = process.env.GOOGLE_CREDS_JSON.trim();

			// Handle double-escaped or multiline JSON automatically
			if (raw.startsWith("{")) {
				creds = JSON.parse(raw);
			} else if (raw.startsWith('"{')) {
				creds = JSON.parse(JSON.parse(raw)); // stringified twice
			}
		}
	} catch (err) {
		console.warn(
			"⚠️ Failed to parse GOOGLE_CREDS_JSON from .env, trying local file:",
			err.message
		);
	}

	// Fallback to service-account.json if .env failed
	if (!creds) {
		const filePath = path.resolve(process.cwd(), "service-account.json");
		if (!fs.existsSync(filePath)) {
			throw new Error(
				"❌ Google credentials missing. Either set GOOGLE_CREDS_JSON in .env or place service-account.json in project root."
			);
		}
		const fileData = fs.readFileSync(filePath, "utf8");
		creds = JSON.parse(fileData);
	}

	const auth = new google.auth.GoogleAuth({
		credentials: creds,
		scopes: SCOPES,
	});
	return auth;
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
		"influencer",
		"videoUrl",
		"title",
		"topic",
		"caption",
		"scheduledAt",
		"status",
		"permalink",
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
		job.influencer,
		job.videoUrl,
		job.title,
		job.topic,
		job.caption,
		job.scheduledAt,
		job.status,
		job.permalink,
		job.views || "",
		job.likes || "",
		job.comments || "",
	];
	const rowNum = idx === -1 ? jobs.length + 2 : idx + 2;
	const range = `Sheet1!A${rowNum}:L${rowNum}`;
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
	if (!found) return;
	await upsertJob({ ...found, ...updates });
}
