import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const OrigamiDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 bg-[#0F0F0F] border border-white/10 px-5 py-3 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors text-slate-200 w-48 justify-between"
            >
                <span>Select Action</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown size={16} />
                </motion.div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={{
                            hidden: { opacity: 0, y: -10, scaleY: 0.8, filter: 'blur(5px)' },
                            visible: { 
                                opacity: 1, 
                                y: 8, 
                                scaleY: 1, 
                                filter: 'blur(0px)',
                                transition: { 
                                    staggerChildren: 0.05,
                                    duration: 0.2
                                } 
                            }
                        }}
                        style={{ transformOrigin: "top" }}
                        className="absolute top-full left-0 w-48 bg-[#0F0F0F]/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 p-1"
                    >
                        {["Edit Profile", "System Settings", "Export Data", "Disconnect"].map((item, i) => (
                            <motion.li
                                key={item}
                                variants={{
                                    hidden: { opacity: 0, x: -10 },
                                    visible: { opacity: 1, x: 0 }
                                }}
                            >
                                <a href="#" className={`block px-4 py-2.5 text-sm rounded-lg hover:bg-white/10 transition-colors ${i === 3 ? 'text-red-400 hover:bg-red-500/10' : 'text-slate-300'}`}>
                                    {item}
                                </a>
                            </motion.li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OrigamiDropdown;