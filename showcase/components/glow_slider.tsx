import React, { useState, useRef } from "react";
import { motion } from "framer-motion";

const GlowSlider = () => {
	const [value, setValue] = useState(50);
	const ref = useRef<HTMLDivElement>(null);

	const handleMouseDown = (e: React.MouseEvent) => {
		if (!ref.current) return;
		updateValue(e.clientX);
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const handleMouseMove = (e: MouseEvent) => updateValue(e.clientX);
	const handleMouseUp = () => {
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
	};

	const updateValue = (clientX: number) => {
		if (!ref.current) return;
		const { left, width } = ref.current.getBoundingClientRect();
		const percent = Math.min(Math.max((clientX - left) / width, 0), 1);
		setValue(Math.round(percent * 100));
	};

	return (
		<div className="w-64">
			<div className="flex justify-between mb-2 text-xs font-mono text-slate-500">
				<span>INTENSITY</span>
				<span>{value}%</span>
			</div>
			<div
				ref={ref}
				onMouseDown={handleMouseDown}
				className="relative h-6 flex items-center cursor-pointer group"
			>
				{/* Track Background */}
				<div className="absolute h-1 w-full bg-slate-800 rounded-full overflow-hidden">
					<div className="absolute inset-0 w-full h-full opacity-20 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.2)_50%,transparent_100%)]" />
				</div>

				{/* Active Track */}
				<motion.div
					className="absolute h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.4)]"
					style={{ width: `${value}%` }}
				/>

				{/* Thumb */}
				<motion.div
					className="absolute h-5 w-5 bg-[#050505] border-2 border-purple-500 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)] z-10 flex items-center justify-center"
					style={{ left: `calc(${value}% - 10px)` }}
					whileHover={{ scale: 1.2 }}
					whileTap={{ scale: 0.9 }}
				>
					<div className="w-1.5 h-1.5 bg-white rounded-full" />
				</motion.div>
			</div>
		</div>
	);
};

export default GlowSlider;
