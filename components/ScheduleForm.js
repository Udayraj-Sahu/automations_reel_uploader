"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
	Upload,
	Loader2,
	CheckCircle2,
	Calendar,
	FileVideo,
	Type,
	Sparkles,
} from "lucide-react";

function generateId() {
	return "reel-" + Math.random().toString(36).substring(2, 9);
}

export default function ScheduleForm() {
	const [form, setForm] = useState({
		videoFile: null,
		videoUrl: "",
		title: "",
		topic: "",
		caption: "",
		scheduledAt: "",
	});
	const [msg, setMsg] = useState("");
	const [uploading, setUploading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);
	const [generating, setGenerating] = useState(false);

	// ✅ Upload to Cloudinary
	const handleFileUpload = async (e) => {
		const file = e.target.files[0];
		if (!file) return;

		setUploading(true);
		setMsg("⏳ Uploading video to Cloudinary...");

		const formData = new FormData();
		formData.append("file", file);

		try {
			const res = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const data = await res.json();
			if (res.ok && data.url) {
				setForm((prev) => ({ ...prev, videoUrl: data.url }));
				setMsg("✅ Video uploaded successfully!");
			} else {
				setMsg("❌ Upload failed: " + (data.error || "Unknown error"));
			}
		} catch (err) {
			setMsg("❌ Network error: " + err.message);
		}

		setUploading(false);
	};

	// ✅ AI Generate Caption
	const handleGenerateCaption = async () => {
		if (!form.title && !form.topic) {
			setMsg("⚠️ Please enter a title or topic first.");
			return;
		}

		setGenerating(true);
		setMsg("🤖 Generating caption using AI...");

		try {
			const res = await fetch("/api/ai/generate-caption", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: form.title,
					topic: form.topic,
				}),
			});

			const data = await res.json();

			if (res.ok && data.caption) {
				setForm((prev) => ({ ...prev, caption: data.caption }));
				setMsg("✅ Caption generated successfully!");
			} else {
				setMsg("❌ Failed to generate caption: " + data.error);
			}
		} catch (err) {
			setMsg("❌ " + err.message);
		}

		setGenerating(false);
	};

	// ✅ Schedule reel
	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setMsg("⏳ Scheduling reel...");

		const body = {
			id: generateId(),
			influencer:
				process.env.NEXT_PUBLIC_APP_NAME || "Default Influencer",
			videoUrl: form.videoUrl,
			title: form.title,
			topic: form.topic,
			caption: form.caption,
			scheduledAt: form.scheduledAt,
		};

		try {
			const res = await fetch("/api/schedule", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(body),
			});

			const json = await res.json();

			if (res.ok) {
				setMsg("✅ Scheduled successfully!");
				setSuccess(true);
				setForm({
					videoFile: null,
					videoUrl: "",
					title: "",
					topic: "",
					caption: "",
					scheduledAt: "",
				});
			} else {
				setMsg("❌ " + (json.error || "Error scheduling reel"));
			}
		} catch (err) {
			setMsg("❌ " + err.message);
		}

		setSubmitting(false);
		setTimeout(() => setSuccess(false), 2500);
	};

	return (
		<motion.form
			onSubmit={handleSubmit}
			className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100 space-y-5"
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}>
			{/* Header */}
			<div className="flex items-center space-x-3 mb-2">
				<motion.div
					className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg"
					whileHover={{ rotate: 180 }}
					transition={{ duration: 0.3 }}>
					<Upload className="w-5 h-5 text-white" />
				</motion.div>
				<h2 className="text-gray-900 font-semibold">
					Upload & Schedule
				</h2>
			</div>

			{/* Video Upload */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-1">
					<FileVideo className="w-4 h-4 inline mr-1" />
					Video File
				</label>
				<motion.div
					className="relative border-2 border-dashed border-purple-200 rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer"
					whileHover={{ scale: 1.02 }}>
					<input
						type="file"
						accept="video/mp4"
						onChange={handleFileUpload}
						className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
					/>
					{uploading ? (
						<div className="flex flex-col items-center">
							<Loader2 className="w-6 h-6 text-purple-500 animate-spin mb-2" />
							<p className="text-sm text-gray-600">
								Uploading...
							</p>
						</div>
					) : form.videoUrl ? (
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}>
							<video
								src={form.videoUrl}
								className="w-full h-32 object-cover rounded-lg mb-2"
								controls
							/>
							<p className="text-green-600 text-sm break-words">
								✅ Uploaded successfully!
							</p>
						</motion.div>
					) : (
						<>
							<Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
							<p className="text-sm text-gray-600">
								Click to upload video
							</p>
							<p className="text-xs text-gray-400 mt-1">
								MP4 up to 100MB supported
							</p>
						</>
					)}
				</motion.div>
			</div>

			{/* Title & Topic */}
			<div className="grid grid-cols-2 gap-3">
				<div>
					<label className="block text-sm text-gray-700 mb-1">
						<Type className="w-4 h-4 inline mr-1" />
						Title
					</label>
					<input
						className="border p-2 rounded w-full"
						placeholder="Title"
						value={form.title}
						onChange={(e) =>
							setForm({ ...form, title: e.target.value })
						}
						required
					/>
				</div>
				<div>
					<label className="block text-sm text-gray-700 mb-1">
						Topic (optional)
					</label>
					<input
						className="border p-2 rounded w-full"
						placeholder="e.g., Productivity"
						value={form.topic}
						onChange={(e) =>
							setForm({ ...form, topic: e.target.value })
						}
					/>
				</div>
			</div>

			{/* Caption + AI Button */}
			<div>
				<div className="flex items-center justify-between mb-1">
					<label className="block text-sm text-gray-700">
						<Sparkles className="w-4 h-4 inline mr-1" />
						Caption
					</label>
					<motion.button
						type="button"
						onClick={handleGenerateCaption}
						disabled={generating}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className={`text-xs flex items-center gap-1 px-3 py-1 rounded-full text-white ${
							generating
								? "bg-purple-300 cursor-not-allowed"
								: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
						}`}>
						{generating ? (
							<>
								<Loader2 className="w-3 h-3 animate-spin" />
								Generating...
							</>
						) : (
							<>
								<Sparkles className="w-3 h-3" /> AI Generate
							</>
						)}
					</motion.button>
				</div>
				<textarea
					className="border p-2 rounded w-full resize-none"
					placeholder="Enter caption (or use AI Generate)"
					rows={3}
					value={form.caption}
					onChange={(e) =>
						setForm({ ...form, caption: e.target.value })
					}
				/>
			</div>

			{/* Schedule */}
			<div>
				<label className="block text-sm text-gray-700 mb-1">
					<Calendar className="w-4 h-4 inline mr-1" />
					Schedule Time
				</label>
				<input
					type="datetime-local"
					className="border p-2 rounded w-full"
					value={form.scheduledAt}
					onChange={(e) =>
						setForm({ ...form, scheduledAt: e.target.value })
					}
					required
				/>
			</div>

			{/* Submit */}
			<motion.button
				type="submit"
				disabled={!form.videoUrl || submitting}
				whileHover={{ scale: 1.02 }}
				whileTap={{ scale: 0.98 }}
				className={`w-full py-3 rounded-xl text-white font-medium transition ${
					success
						? "bg-green-500 hover:bg-green-600"
						: "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
				} ${submitting && "opacity-70 cursor-not-allowed"}`}>
				<AnimatePresence mode="wait">
					{success ? (
						<motion.span
							key="success"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="flex items-center justify-center">
							<CheckCircle2 className="w-5 h-5 mr-2" />
							Scheduled Successfully!
						</motion.span>
					) : submitting ? (
						<motion.span
							key="submitting"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="flex items-center justify-center">
							<Loader2 className="w-5 h-5 mr-2 animate-spin" />
							Scheduling...
						</motion.span>
					) : (
						<motion.span
							key="default"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className="flex items-center justify-center">
							<Upload className="w-5 h-5 mr-2" />
							Add to Schedule
						</motion.span>
					)}
				</AnimatePresence>
			</motion.button>

			{/* Message */}
			{msg && (
				<motion.p
					className={`text-sm mt-2 ${
						msg.includes("✅")
							? "text-green-600"
							: msg.includes("❌")
							? "text-red-600"
							: "text-gray-600"
					}`}
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}>
					{msg}
				</motion.p>
			)}
		</motion.form>
	);
}
