import React, { useState } from 'react';
import { motion } from 'framer-motion';

const segments = ["Daily", "Weekly", "Monthly"];

const SegmentedControl = () => {
    const [selected, setSelected] = useState(segments[1]);

    return (
        <div className="inline-flex bg-[#0A0A0A] p-1.5 rounded-xl border border-white/5 shadow-inner">
            {segments.map((s) => (
                <button
                    key={s}
                    onClick={() => setSelected(s)}
                    className="relative px-6 py-2 text-xs font-bold uppercase tracking-wider outline-none"
                >
                    {selected === s && (
                        <motion.div
                            layoutId="segment-bg"
                            className="absolute inset-0 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-lg z-0"
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            {/* Subtle glossy top shine */}
                            <div className="absolute inset-x-2 top-0 h-[1px] bg-white/20" />
                        </motion.div>
                    )}
                    <span className={`relative z-10 transition-colors duration-200 ${
                        selected === s ? "text-white" : "text-slate-500 hover:text-slate-300"
                    }`}>
                        {s}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default SegmentedControl;