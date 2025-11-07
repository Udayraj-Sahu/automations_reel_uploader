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

		const buffer = Buffer.from(await file.arrayBuffer());
		const tmpDir = os.tmpdir();
		const tmpPath = path.join(tmpDir, file.name);
		await fs.writeFile(tmpPath, buffer);

		const url = await uploadToCloudinary(tmpPath);

		try {
			await fs.unlink(tmpPath);
		} catch (_) {}

		return NextResponse.json({ url });
	} catch (err) {
		console.error("❌ Upload error:", err);
		return NextResponse.json({ error: err.message }, { status: 500 });
	}
}

// ✅ Fix large file uploads without changing logic
export const config = {
	api: {
		bodyParser: false,
		sizeLimit: "200mb", // or "25mb" depending on your video size
	},
};
