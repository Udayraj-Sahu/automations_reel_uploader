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
	const config = {
		scheduled: {
			icon: Clock,
			text: "Scheduled",
			style: "bg-orange-100 text-orange-700 border border-orange-200",
			iconColor: "text-orange-500",
		},
		published: {
			icon: CheckCircle,
			text: "Published",
			style: "bg-green-100 text-green-700 border border-green-200",
			iconColor: "text-green-500",
		},
		failed: {
			icon: XCircle,
			text: "Failed",
			style: "bg-red-100 text-red-700 border border-red-200",
			iconColor: "text-red-500",
		},
		publishing: {
			icon: Loader2,
			text: "Publishing...",
			style: "bg-purple-100 text-purple-700 border border-purple-200",
			iconColor: "text-purple-500",
		},
	}[status] || {
		icon: Clock,
		text: status || "Pending",
		style: "bg-gray-100 text-gray-700 border border-gray-200",
		iconColor: "text-gray-500",
	};

	const Icon = config.icon;

	const platformIcon =
		label?.toLowerCase() === "ig" ? (
			<Instagram className="w-3.5 h-3.5 text-pink-600" />
		) : label?.toLowerCase() === "yt" ? (
			<Youtube className="w-3.5 h-3.5 text-red-600" />
		) : null;

	return (
		<motion.span
			className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.style}`}
			initial={{ scale: 0.9, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}>
			{/* Platform Icon */}
			{platformIcon}

			{/* Status Icon */}
			<motion.div
				animate={
					status === "publishing" ? { rotate: 360 } : { rotate: 0 }
				}
				transition={
					status === "publishing"
						? { duration: 1, repeat: Infinity, ease: "linear" }
						: {}
				}>
				<Icon className={`w-4 h-4 ${config.iconColor}`} />
			</motion.div>

			{/* Label Text */}
			<span>{config.text}</span>

			{/* Animated dot for published */}
			{status === "published" && (
				<motion.div
					className="w-2 h-2 bg-green-500 rounded-full"
					animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
					transition={{ duration: 1.5, repeat: Infinity }}
				/>
			)}
		</motion.span>
	);
}
