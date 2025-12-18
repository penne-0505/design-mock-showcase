import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CinematicInput = ({ placeholder, type = "text", icon: Icon }) => {
  const [focused, setFocused] = useState(false);

  return (
    <div className="relative group w-64">
      <motion.div
        animate={focused ? { opacity: 1, scale: 1 } : { opacity: 0.5, scale: 0.98 }}
        className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-lg transition-all duration-500 rounded-lg -z-10"
      />
      
      <div className={`relative flex items-center bg-[#0F0F0F] border transition-colors duration-300 rounded-lg overflow-hidden ${
          focused ? 'border-purple-500/50' : 'border-white/10'
      }`}>
        <div className="pl-4 text-slate-500">
            {Icon && <Icon size={18} />}
        </div>
        <input
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-4 py-3 text-sm text-white placeholder-slate-600 outline-none font-medium"
          placeholder={placeholder}
        />
        {/* Status Indicator */}
        <div className="pr-4">
             <motion.div 
                animate={{ scale: focused ? 1 : 0 }}
                className="w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(192,132,252,0.8)]" 
             />
        </div>
      </div>
    </div>
  );
};

export default CinematicInput;
