"use client";
import { motion } from "motion/react";
import {
	CheckCircle,
	Clock,
	XCircle,
	Loader2,
	Instagram,
	Youtube,
} from "lucide-react";

export default function StatusBadge({ label, status }) {
	let icon, color, textColor, bgColor, borderColor;

	// Base color logic by platform label
	if (label === "IG") {
		color = "text-pink-500";
		bgColor = "bg-pink-100";
		borderColor = "border-pink-200";
		textColor = "text-pink-700";
		icon = Instagram;
	} else if (label === "YT") {
		color = "text-red-500";
		bgColor = "bg-red-100";
		borderColor = "border-red-200";
		textColor = "text-red-700";
		icon = Youtube;
	} else {
		color = "text-gray-500";
		bgColor = "bg-gray-100";
		borderColor = "border-gray-200";
		textColor = "text-gray-700";
		icon = Clock;
	}

	let IconComponent = icon;
	let text = status;

	// 🟢 Switch icon & style dynamically based on status
	switch (status) {
		case "posted":
			IconComponent = CheckCircle;
			color = "text-green-500";
			bgColor = "bg-green-100";
			borderColor = "border-green-200";
			textColor = "text-green-700";
			text = "posted";
			break;

		case "failed":
			IconComponent = XCircle;
			color = "text-red-500";
			bgColor = "bg-red-100";
			borderColor = "border-red-200";
			textColor = "text-red-700";
			text = "failed";
			break;

		case "publishing":
			IconComponent = Loader2;
			color = "text-purple-500";
			bgColor = "bg-purple-100";
			borderColor = "border-purple-200";
			textColor = "text-purple-700";
			text = "publishing...";
			break;

		default:
			// Keep original icon (YouTube / Instagram) for pending
			text = "pending";
			break;
	}

	return (
		<motion.span
			className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${bgColor} ${borderColor} ${textColor}`}
			initial={{ scale: 0.8, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}>
			<motion.div
				animate={
					status === "publishing" ? { rotate: 360 } : { rotate: 0 }
				}
				transition={
					status === "publishing"
						? { duration: 1, repeat: Infinity, ease: "linear" }
						: {}
				}>
				<IconComponent className={`w-4 h-4 ${color}`} />
			</motion.div>
			<span className="capitalize">{text}</span>
			{status === "posted" && (
				<motion.div
					className="w-2 h-2 bg-green-500 rounded-full"
					animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				/>
			)}
		</motion.span>
	);
}
