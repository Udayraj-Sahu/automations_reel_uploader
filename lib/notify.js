import axios from "axios";
export async function notify(text) {
	const token = process.env.TELEGRAM_BOT_TOKEN;
	const chat = process.env.TELEGRAM_CHAT_ID;
	if (!token || !chat) return;
	await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
		chat_id: chat,
		text,
	});
}
