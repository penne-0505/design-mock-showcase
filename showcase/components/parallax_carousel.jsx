import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const cards = [
  { id: 1, title: "Neon Genesis", color: "from-pink-500 to-rose-500" },
  { id: 2, title: "Cyber Void", color: "from-purple-500 to-indigo-500" },
  { id: 3, title: "Quantum Leap", color: "from-cyan-500 to-blue-500" },
];

const ParallaxCarousel = () => {
  const [index, setIndex] = useState(0);

  const nextCard = () => setIndex((prev) => (prev + 1) % cards.length);

  return (
    <div className="relative w-80 h-64 perspective-1000" onClick={nextCard}>
      <AnimatePresence mode="popLayout">
        {cards.map((card, i) => {
          // Calculate relative index for stacking
          const offset = (i - index + cards.length) % cards.length;
          if (offset > 2) return null; // Show only top 3

          return (
            <motion.div
              key={card.id}
              layoutId={`card-${card.id}`}
              initial={{ scale: 0.8, opacity: 0, z: -100, y: 50 }}
              animate={{
                scale: offset === 0 ? 1 : 1 - offset * 0.1,
                opacity: offset === 0 ? 1 : 0.5 - offset * 0.2,
                zIndex: cards.length - offset,
                y: offset * 20,
                rotateX: offset * -5,
              }}
              exit={{ scale: 1.1, opacity: 0, filter: 'blur(10px)' }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className={`absolute inset-0 rounded-2xl p-6 cursor-pointer border border-white/10 bg-[#0A0A0A] shadow-2xl overflow-hidden flex flex-col justify-end`}
            >
              <div className={`absolute top-0 right-0 p-32 blur-[60px] opacity-20 bg-gradient-to-br ${card.color}`} />
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-1 font-serif">{card.title}</h3>
                <p className="text-xs text-slate-400 font-mono tracking-widest uppercase">Click to Navigate</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default ParallaxCarousel;
