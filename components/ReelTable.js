"use client";
import { useState } from "react";
import useSWR from "swr";
import { motion, AnimatePresence } from "motion/react";
import { Play, ExternalLink, Loader2, Clock } from "lucide-react";
import StatusBadge from "./StatusBadge";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function ReelTable() {
	const { data, mutate, isLoading } = useSWR("/api/schedule", fetcher, {
		refreshInterval: 10000,
	});

	const [msg, setMsg] = useState("");
	const [postingId, setPostingId] = useState(null);

	if (isLoading)
		return (
			<div className="flex justify-center py-10 text-gray-500">
				<Loader2 className="w-6 h-6 animate-spin mr-2" />
				Loading Reels…
			</div>
		);

	const handlePostNow = async (reel) => {
		if (!reel.videoUrl) return alert("❌ Missing video URL for this reel.");
		setPostingId(reel.id);
		setMsg(`⏳ Publishing "${reel.title}"...`);

		try {
			const res = await fetch("/api/publish", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: reel.id,
					videoUrl: reel.videoUrl,
					title: reel.title,
					topic: reel.topic || "",
				}),
			});

			const json = await res.json();

			if (res.ok) {
				setMsg(`✅ Published successfully! ${json.permalink}`);
				await mutate();
			} else {
				setMsg(`❌ Failed: ${json.error}`);
			}
		} catch (err) {
			setMsg(`❌ Error: ${err.message}`);
		}

		setPostingId(null);
		mutate();
	};

	return (
		<motion.div
			className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100 overflow-hidden"
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}>
			{/* Header */}
			<div className="p-6 border-b border-purple-100 flex items-center justify-between">
				<div className="flex items-center space-x-3">
					<motion.div
						className="bg-gradient-to-br from-pink-500 to-orange-500 p-2 rounded-lg"
						whileHover={{ rotate: 180 }}
						transition={{ duration: 0.3 }}>
						<Play className="w-5 h-5 text-white" />
					</motion.div>
					<div>
						<h2 className="text-gray-900 font-medium">
							Scheduled Reels
						</h2>
						<p className="text-sm text-gray-500">
							Live from Google Sheets
						</p>
					</div>
				</div>
				<motion.div
					className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full text-sm text-purple-700"
					animate={{ scale: [1, 1.05, 1] }}
					transition={{ duration: 2, repeat: Infinity }}>
					{data?.length || 0} total
				</motion.div>
			</div>

			{/* Message */}
			{msg && (
				<p className="px-6 py-2 text-sm text-gray-700 border-b border-purple-100 bg-gray-50">
					{msg}
				</p>
			)}

			{/* Scrollable Table Section */}
			<div className="max-h-[420px] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-50">
				{!data || data.length === 0 ? (
					<motion.div
						className="p-12 text-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}>
						<Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
						<p className="text-gray-500">No scheduled reels yet</p>
						<p className="text-sm text-gray-400 mt-2">
							Upload your first reel to get started!
						</p>
					</motion.div>
				) : (
					<table className="min-w-full">
						<thead className="sticky top-0 bg-purple-50/80 backdrop-blur-md z-10">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
									Title
								</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
									Scheduled
								</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
									Status
								</th>
								<th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
									Permalink
								</th>
								<th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
									Action
								</th>
							</tr>
						</thead>
						<tbody>
							<AnimatePresence mode="popLayout">
								{data.map((reel, index) => (
									<motion.tr
										key={reel.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -10 }}
										transition={{
											duration: 0.2,
											delay: index * 0.05,
										}}
										className="border-t border-gray-100 hover:bg-purple-50/30 transition-colors">
										<td className="px-6 py-4 font-medium text-gray-900">
											{reel.title}
										</td>
										<td className="px-6 py-4 text-sm text-gray-600">
											{reel.scheduledAt || "—"}
										</td>
										<td className="px-6 py-4">
											<StatusBadge status={reel.status} />
										</td>
										<td className="px-6 py-4 truncate max-w-[260px]">
											{reel.permalink ? (
												<motion.a
													href={reel.permalink}
													target="_blank"
													rel="noreferrer"
													className="text-purple-600 hover:text-purple-700 flex items-center space-x-1"
													whileHover={{
														scale: 1.05,
													}}>
													<span>View</span>
													<ExternalLink className="w-4 h-4" />
												</motion.a>
											) : (
												<span className="text-gray-400 text-sm">
													N/A
												</span>
											)}
										</td>
										<td className="px-6 py-4 text-center">
											{postingId === reel.id ? (
												<div className="flex justify-center">
													<Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
												</div>
											) : (
												<motion.button
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													onClick={() =>
														handlePostNow(reel)
													}
													disabled={
														postingId === reel.id
													}
													className="px-3 py-1.5 rounded text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm">
													Post Now
												</motion.button>
											)}
										</td>
									</motion.tr>
								))}
							</AnimatePresence>
						</tbody>
					</table>
				)}
			</div>

			{/* Footer / Live Update Indicator */}
			<div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100 flex items-center justify-between text-xs text-gray-500">
				<div className="flex items-center space-x-2">
					<motion.div
						className="w-2 h-2 bg-green-500 rounded-full"
						animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
						transition={{ duration: 2, repeat: Infinity }}
					/>
					<span>Live updates every 10s</span>
				</div>
				<span className="text-gray-400">Auto-synced with schedule</span>
			</div>
		</motion.div>
	);
}
