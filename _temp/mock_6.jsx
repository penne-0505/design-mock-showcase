import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Leaf, MapPin, Users, Moon, Sun, Camera, MessageCircle } from 'lucide-react';

/* 
  FONT LOADING INSTRUCTION:
  To get the intended aesthetic, please add these fonts to your HTML <head> or CSS import:
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Manrope:wght@300;400;500;600&display=swap" rel="stylesheet">
*/

// --- Components ---

const GrainOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-multiply" 
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
);

const Navbar = () => (
  <motion.nav 
    initial={{ y: -20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    className="fixed top-0 left-0 right-0 z-40 px-6 py-6 flex justify-between items-center pointer-events-none"
  >
    <div className="pointer-events-auto flex items-center gap-2 bg-stone-100/80 backdrop-blur-md px-4 py-2 rounded-full border border-stone-200 shadow-sm">
      <Leaf className="w-4 h-4 text-emerald-700" />
      <span className="font-serif font-bold text-stone-800 tracking-tight">Minecraft Server 🍀</span>
    </div>
    
    <div className="pointer-events-auto">
      <a href="#discord" className="group flex items-center gap-2 bg-stone-900 text-stone-50 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-emerald-800 transition-colors duration-300">
        <span>Discordに参加</span>
        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
      </a>
    </div>
  </motion.nav>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <header className="relative h-screen w-full overflow-hidden flex flex-col justify-center items-center text-center px-6">
      <div className="absolute inset-0 z-0 bg-stone-100">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-50/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-stone-200/40 rounded-full blur-3xl" />
      </div>

      <motion.div 
        style={{ y: y1, opacity }}
        className="relative z-10 max-w-4xl mx-auto space-y-8"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="inline-flex items-center gap-2 text-emerald-800/80 text-sm font-medium tracking-widest uppercase border-b border-emerald-800/20 pb-1"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Established 2024
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-stone-900 leading-[0.95] tracking-tight"
        >
          帰る場所は、<br/>
          <span className="italic text-emerald-900">ここにある。</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-sans text-stone-600 max-w-lg mx-auto leading-relaxed md:text-lg"
        >
          自由で、静かで、懐かしい。Minecraft Server 🍀は、
          ただゲームをする場所ではなく、あなたの日常に寄り添う
          デジタルな隠れ家です。
        </motion.p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 text-stone-400 flex flex-col items-center gap-2"
      >
        <span className="text-xs uppercase tracking-widest">Scroll to Explore</span>
        <div className="w-[1px] h-12 bg-gradient-to-b from-stone-400 to-transparent" />
      </motion.div>
    </header>
  );
};

const FeatureSection = () => {
  const features = [
    {
      title: "Curation",
      desc: "洗練された建築と、自然生成が調和する世界。",
      icon: <Camera className="w-5 h-5" />
    },
    {
      title: "Community",
      desc: "程よい距離感。挨拶だけでも、深い対話でも。",
      icon: <Users className="w-5 h-5" />
    },
    {
      title: "Permanence",
      desc: "あなたの作ったものが、誰かの思い出になる。",
      icon: <MapPin className="w-5 h-5" />
    }
  ];

  return (
    <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto bg-white rounded-[2rem] shadow-sm my-12 border border-stone-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        {features.map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2, duration: 0.8 }}
            className="flex flex-col gap-4 p-6 hover:bg-stone-50 transition-colors rounded-xl duration-500 cursor-default group"
          >
            <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-emerald-800 group-hover:bg-emerald-100 transition-colors">
              {f.icon}
            </div>
            <h3 className="font-serif text-2xl text-stone-800">{f.title}</h3>
            <p className="font-sans text-stone-500 leading-relaxed text-sm">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

const ScreenshotGrid = () => {
  return (
    <section className="py-24 px-4 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 px-4">
        <h2 className="font-serif text-4xl md:text-5xl text-stone-900 leading-tight">
          Archives of<br /><span className="italic text-stone-500">Memories</span>
        </h2>
        <p className="font-sans text-stone-500 text-sm mt-4 md:mt-0 max-w-xs text-right">
          サーバー内で撮影された風景。加工されていない、ありのままの日常。
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-4 md:grid-rows-2 gap-4 h-[120vh] md:h-[80vh]">
        {/* Large Item 1 */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="col-span-1 md:col-span-2 row-span-2 relative overflow-hidden rounded-2xl bg-stone-200 group"
        >
          {/* Placeholder for Screenshot */}
          <div className="absolute inset-0 bg-stone-300 flex items-center justify-center text-stone-500 font-serif italic text-lg z-10">
            Screenshot: Main Town Square
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-20" />
          <div className="absolute bottom-6 left-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-white font-medium">
            <p className="text-sm backdrop-blur-md bg-white/10 px-3 py-1 rounded-full border border-white/20 inline-block">2024.03.12 - 中央広場の朝</p>
          </div>
        </motion.div>

        {/* Tall Item */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, delay: 0.1 }}
           viewport={{ once: true }}
           className="col-span-1 row-span-2 md:row-span-2 relative overflow-hidden rounded-2xl bg-stone-200 group"
        >
          <div className="absolute inset-0 bg-stone-300 flex items-center justify-center text-stone-500 font-serif italic text-lg z-10">
            Screenshot: Tower
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent opacity-60" />
          <div className="absolute top-6 right-6 p-2 bg-white/90 rounded-full z-20">
             <Sun className="w-4 h-4 text-orange-400" />
          </div>
        </motion.div>

        {/* Small Item 1 */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           viewport={{ once: true }}
           className="col-span-1 md:row-span-1 relative overflow-hidden rounded-2xl bg-stone-200 group"
        >
           <div className="absolute inset-0 bg-stone-300 flex items-center justify-center text-stone-500 font-serif italic text-lg z-10">
            Screenshot: Interio
          </div>
        </motion.div>

        {/* Small Item 2 */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8, delay: 0.3 }}
           viewport={{ once: true }}
           className="col-span-1 md:row-span-1 relative overflow-hidden rounded-2xl bg-stone-200 group"
        >
           <div className="absolute inset-0 bg-stone-800 flex items-center justify-center text-stone-400 font-serif italic text-lg z-10">
            Screenshot: Night View
            <Moon className="w-4 h-4 ml-2" />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const NarrativeSection = () => {
  return (
    <section className="py-32 bg-stone-900 text-stone-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10">
         <div className="absolute w-[800px] h-[800px] bg-emerald-500 rounded-full blur-[120px] top-[-200px] right-[-200px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-16">
        <div className="md:w-1/2">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="aspect-[4/5] bg-stone-800 rounded-lg overflow-hidden border border-stone-700 relative"
           >
              {/* Image Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center text-stone-600 font-serif italic">
                 Cinematic Shot: A player fishing
              </div>
           </motion.div>
        </div>
        
        <div className="md:w-1/2 space-y-8">
          <motion.h3 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-3xl md:text-4xl text-emerald-50 leading-tight"
          >
            静寂の中で、<br />
            物語は紡がれる。
          </motion.h3>
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.2 }}
             viewport={{ once: true }}
             className="space-y-6 font-sans text-stone-400 font-light leading-loose"
          >
            <p>
              ここは競争の場ではありません。効率を求める必要も、急ぐ必要もありません。
              夕暮れ時の空の色を眺めたり、友人と小さな家を建てたり、ただ散歩をしたり。
            </p>
            <p>
              Minecraft Server 🍀は、そんな「何気ない時間」を大切にする人たちのためのコミュニティです。
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

const DiscordCTA = () => {
  return (
    <section id="discord" className="py-32 px-6 flex justify-center bg-stone-100">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="w-full max-w-5xl bg-white rounded-[3rem] p-12 md:p-24 text-center shadow-xl shadow-stone-200/50 border border-stone-100 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
        
        <div className="relative z-10 space-y-10">
          <MessageCircle className="w-12 h-12 mx-auto text-emerald-600/50" />
          
          <h2 className="font-serif text-4xl md:text-6xl text-stone-900 tracking-tight">
            Invitation to<br />the Garden
          </h2>
          
          <p className="font-sans text-stone-500 max-w-md mx-auto">
            Discordに参加して、まずは雰囲気を覗いてみてください。<br/>
            参加条件は「誰かの居心地を大切にできること」だけ。
          </p>

          <motion.button 
            whileHover={{ scale: 1.02, backgroundColor: "#064e3b" }}
            whileTap={{ scale: 0.98 }}
            className="bg-emerald-900 text-emerald-50 px-8 py-4 rounded-full text-lg font-medium inline-flex items-center gap-3 transition-colors shadow-lg shadow-emerald-900/20"
          >
            <span>Discordに参加する</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <p className="text-xs text-stone-400 mt-8">
            *参加は無料です。いつでも退出可能です。
          </p>
        </div>
      </motion.div>
    </section>
  )
}

const Footer = () => (
  <footer className="bg-white border-t border-stone-100 py-12 px-6">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2 opacity-60">
        <Leaf className="w-4 h-4 text-stone-400" />
        <span className="font-serif text-stone-600">Minecraft Server 🍀</span>
      </div>
      
      <div className="flex gap-8 text-sm text-stone-400 font-sans">
        <a href="#" className="hover:text-stone-800 transition-colors">Guidelines</a>
        <a href="#" className="hover:text-stone-800 transition-colors">Map Viewer</a>
        <a href="#" className="hover:text-stone-800 transition-colors">Contact</a>
      </div>
      
      <div className="text-xs text-stone-300">
        © 2024 Minecraft Server 🍀. Not affiliated with Mojang AB.
      </div>
    </div>
  </footer>
);

export default function App() {
  return (
    <div className="bg-stone-50 min-h-screen selection:bg-emerald-200 selection:text-emerald-900">
      <GrainOverlay />
      <Navbar />
      <Hero />
      <FeatureSection />
      <NarrativeSection />
      <ScreenshotGrid />
      <DiscordCTA />
      <Footer />
    </div>
  );
}