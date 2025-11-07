import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

export function StatsCard({ icon: Icon, label, value, color, delay }) {
	const count = useMotionValue(0);
	const spring = useSpring(count, { stiffness: 80, damping: 20 });
	const display = useTransform(spring, (latest) => Math.round(latest));

	// animate when value changes
	if (typeof value === "number") count.set(value);

	return (
		<motion.div
			className="p-6 bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay, duration: 0.4 }}>
			<div className="flex items-center space-x-3">
				<div
					className={`p-3 rounded-xl bg-${color}-100 text-${color}-600`}>
					<Icon className="w-6 h-6" />
				</div>
				<div>
					<p className="text-sm text-gray-500">{label}</p>
					<motion.p className="text-2xl font-semibold text-gray-900">
						{typeof value === "number" ? display : value}
					</motion.p>
				</div>
			</div>
		</motion.div>
	);
}
