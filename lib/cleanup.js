import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";
import os from "os";

export async function POST(req) {
	try {
		const data = await req.formData();
		const file = data.get("file");
		if (!file) throw new Error("No file uploaded");

		// Use OS temp directory (cross-platform safe)
		const buffer = Buffer.from(await file.arrayBuffer());
		const tmpDir = os.tmpdir();
		const tmpPath = path.join(tmpDir, file.name);
		await fs.writeFile(tmpPath, buffer);

		// Upload to Cloudinary
		const url = await uploadToCloudinary(tmpPath);

		// Optionally remove the temp file (cleanup)
		try {
			await fs.unlink(tmpPath);
		} catch (_) {}

		return NextResponse.json({ url });
	} catch (err) {
		console.error("❌ Upload error:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}
