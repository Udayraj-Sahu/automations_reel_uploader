export async function GET() {
	return new Response(
		JSON.stringify({
			ok: true,
			app: process.env.NEXT_PUBLIC_APP_NAME || "Reels",
		}),
		{ headers: { "content-type": "application/json" } }
	);
}
