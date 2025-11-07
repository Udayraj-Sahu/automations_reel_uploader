"use client";
import "./globals.css";
import { motion } from "motion/react";
import Link from "next/link";

export default function Home() {
	return (
		<main className="relative min-h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden">
			{/* Soft animated gradient background */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1.5 }}
			/>
			<motion.h1
				className="text-4xl font-bold text-gray-900 relative z-10"
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.8 }}>
				Vibcoding Reels Automation
			</motion.h1>

			<motion.p
				className="text-gray-600 mt-3 relative z-10"
				initial={{ y: 30, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.8, delay: 0.2 }}>
				Schedule → Auto-caption → Publish → Track. <br />
				All managed seamlessly via Google Sheets.
			</motion.p>

			<motion.div
				className="mt-6 relative z-10"
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.8, delay: 0.4 }}>
				<Link
					href="/dashboard"
					className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg hover:scale-105 transition-transform duration-200">
					Open Dashboard
				</Link>
			</motion.div>
		</main>
	);
}
