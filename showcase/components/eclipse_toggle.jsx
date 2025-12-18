import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EclipseToggle = () => {
    const [isOn, setIsOn] = useState(false);

    return (
        <div 
            onClick={() => setIsOn(!isOn)}
            className={`w-16 h-9 rounded-full cursor-pointer p-1 transition-colors duration-500 relative overflow-hidden border ${
                isOn ? 'bg-indigo-900/40 border-indigo-500/50' : 'bg-[#0F0F0F] border-white/10'
            }`}
        >
            {/* Background stars */}
            <div className="absolute inset-0 flex items-center justify-around opacity-30">
                <div className="w-0.5 h-0.5 bg-white rounded-full" />
                <div className="w-1 h-1 bg-white rounded-full translate-y-2" />
                <div className="w-0.5 h-0.5 bg-white rounded-full -translate-y-1" />
            </div>

            <motion.div
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`w-7 h-7 rounded-full shadow-lg relative z-10 ${
                    isOn ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'bg-slate-700'
                }`}
                style={{
                    marginLeft: isOn ? '1.75rem' : '0rem'
                }}
            >
                {/* Crater detail for OFF state */}
                {!isOn && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-slate-800/50 rounded-full" />
                )}
            </motion.div>

            {/* Glow when active */}
            {isOn && (
                <motion.div 
                    layoutId="glow"
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-500 blur-xl opacity-40" 
                />
            )}
        </div>
    );
};

export default EclipseToggle;