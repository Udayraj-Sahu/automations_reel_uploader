"use client";
import useSWR from "swr";
import { motion } from "motion/react";
import ScheduleForm from "@/components/ScheduleForm";
import ReelTable from "@/components/ReelTable";
import { StatsCard } from "@/components/StatsCard";
import { Video, TrendingUp, Clock, CheckCircle } from "lucide-react";

const fetcher = (url) => fetch(url).then((r) => r.json());

export default function Dashboard() {
	// --- Fetch all reels from backend ---
	const {
		data: reels,
		mutate,
		isLoading,
	} = useSWR("/api/schedule", fetcher, {
		refreshInterval: 10000, // auto refresh every 10s
	});

	// --- Stats derived from backend data ---
	const totalReels = reels?.length || 0;
	const published = reels?.filter((r) => r.status === "posted").length || 0;
	const scheduled =
		reels?.filter((r) => r.status === "pending" || r.status === "scheduled")
			.length || 0;
	const avgEngagement = totalReels ? "24.5K" : "0"; // placeholder metric

	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 relative overflow-hidden">
			{/* Background Circles */}
			<div className="fixed inset-0 pointer-events-none">
				{["purple", "pink", "orange"].map((color, i) => (
					<motion.div
						key={color}
						className={`absolute w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-30 ${
							i === 0
								? "top-20 left-20 bg-purple-300"
								: i === 1
								? "top-40 right-20 bg-pink-300"
								: "bottom-10 left-1/2 bg-orange-300"
						}`}
						animate={{
							x: [0, 80, 0],
							y: [0, 50, 0],
						}}
						transition={{
							duration: 15 + i * 3,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
				))}
			</div>

			{/* Header */}
			<motion.header
				className="bg-white/70 backdrop-blur-md border-b border-purple-100 sticky top-0 z-10"
				initial={{ y: -80 }}
				animate={{ y: 0 }}
				transition={{ duration: 0.6 }}>
				<div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
					<div className="flex items-center space-x-3">
						<div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-2xl shadow-md">
							<Video className="w-6 h-6 text-white" />
						</div>
						<div>
							<h1 className="font-semibold text-gray-900">
								Vibcoding Studio
							</h1>
							<p className="text-sm text-gray-500">
								Creator Automation Dashboard
							</p>
						</div>
					</div>
					<div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold shadow-md">
						VS
					</div>
				</div>
			</motion.header>

			{/* Dashboard Content */}
			<div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
				{/* Stats Grid */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<StatsCard
						icon={Video}
						label="Total Reels"
						value={isLoading ? "..." : totalReels}
						color="purple"
					/>
					<StatsCard
						icon={CheckCircle}
						label="Published"
						value={isLoading ? "..." : published}
						color="green"
					/>
					<StatsCard
						icon={Clock}
						label="Scheduled"
						value={isLoading ? "..." : scheduled}
						color="orange"
					/>
					<StatsCard
						icon={TrendingUp}
						label="Avg Engagement"
						value={isLoading ? "..." : avgEngagement}
						color="pink"
					/>
				</div>

				{/* Main Dashboard Layout */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					<motion.div
						initial={{ opacity: 0, x: -40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}>
						<ScheduleForm />
					</motion.div>
					<motion.div
						className="lg:col-span-2"
						initial={{ opacity: 0, x: 40 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}>
						<ReelTable reels={reels || []} mutate={mutate} />
					</motion.div>
				</div>
			</div>
		</div>
	);
}
