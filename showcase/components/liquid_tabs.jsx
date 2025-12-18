import React, { useState } from 'react';
import { motion } from 'framer-motion';

const tabs = ["Overview", "Specs", "Reviews"];

const LiquidTabs = () => {
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div className="flex space-x-1 bg-white/5 p-1 rounded-full backdrop-blur-md border border-white/5 w-fit">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`${
            activeTab === tab ? "text-white" : "text-slate-400 hover:text-slate-200"
          } relative rounded-full px-5 py-2 text-sm font-medium transition-colors outline-none`}
        >
          {activeTab === tab && (
            <motion.div
              layoutId="bubble"
              className="absolute inset-0 z-10 bg-gradient-to-tr from-indigo-500/40 to-purple-500/40 mix-blend-overlay rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
            >
                <div className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-[0_0_15px_rgba(167,139,250,0.3)]" />
            </motion.div>
          )}
          <span className="relative z-20">{tab}</span>
        </button>
      ))}
    </div>
  );
};

export default LiquidTabs;