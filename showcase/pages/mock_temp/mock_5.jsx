import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { Leaf, Wind, Sparkles, ArrowRight, MessageCircle } from 'lucide-react';

/* 
  Font Import Recommendation (Add to HTML head):
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Manrope:wght@300;400;600&display=swap" rel="stylesheet">
*/

// --- Components ---

const GrainOverlay = () => (
  <div className="pointer-events-none fixed inset-0 z-50 opacity-[0.03] mix-blend-overlay"
    style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
    }}
  />
);

const FloatingParticle = ({ delay = 0, x = 0, y = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x, y }}
    animate={{ 
      opacity: [0, 0.4, 0],
      y: [y, y - 100],
      x: [x, x + (Math.random() * 50 - 25)] 
    }}
    transition={{ 
      duration: Math.random() * 5 + 5, 
      repeat: Infinity, 
      delay,
      ease: "easeInOut" 
    }}
    className="absolute w-1 h-1 bg-[#4A5D4F] rounded-full blur-[1px]"
  />
);

const Nav = () => (
  <nav className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center z-40 mix-blend-difference text-[#F2F0E9]">
    <div className="font-serif text-xl italic tracking-wider flex items-center gap-2">
      <Leaf size={18} className="text-emerald-300" />
      Minecraft Server 🍀
    </div>
    <a href="#join" className="text-sm font-sans tracking-widest opacity-80 hover:opacity-100 transition-opacity uppercase">
      Community
    </a>
  </nav>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section className="relative h-screen w-full flex flex-col justify-center items-center overflow-hidden bg-[#F2F0E9] text-[#2C332D]">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div style={{ y: y1 }} className="absolute top-[10%] left-[5%] w-64 h-64 bg-[#D8D4C5] rounded-full blur-3xl opacity-40" />
        <motion.div style={{ y: y1 }} className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[#C4D6C6] rounded-full blur-3xl opacity-40" />
        {[...Array(10)].map((_, i) => (
          <FloatingParticle key={i} delay={i * 1.5} x={Math.random() * window.innerWidth} y={window.innerHeight} />
        ))}
      </div>

      <motion.div 
        style={{ opacity }}
        className="z-10 text-center max-w-4xl px-6"
      >
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 flex justify-center"
        >
          <span className="px-4 py-1 rounded-full border border-[#2C332D]/20 text-xs font-sans tracking-widest uppercase text-[#5A635B]">
            Est. 2024 • Private Community
          </span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight text-[#1A211E] mb-8"
        >
          Build. <br/>
          <span className="italic font-light text-[#4A5D4F]">Breathe.</span> <br/>
          Belong.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="font-sans text-sm md:text-base text-[#5A635B] max-w-md mx-auto leading-relaxed"
        >
          効率性も、クリア目標も、ここにはありません。<br/>
          あるのは、穏やかな時間と、積み上げられる思い出だけ。
        </motion.p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-12 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-widest text-[#5A635B]">Scroll to explore</span>
        <div className="w-[1px] h-12 bg-[#2C332D]/20 overflow-hidden">
            <motion.div 
                animate={{ y: [0, 48, 48] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "circIn" }}
                className="w-full h-1/2 bg-[#2C332D]"
            />
        </div>
      </motion.div>
    </section>
  );
};

const ContentBlock = ({ title, body, image, reverse = false }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <div ref={ref} className={`min-h-[80vh] flex flex-col md:flex-row items-center py-24 px-6 md:px-24 gap-12 ${reverse ? 'md:flex-row-reverse' : ''}`}>
      <motion.div 
        className="flex-1 w-full"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="aspect-[4/5] md:aspect-[3/4] overflow-hidden rounded-sm relative group">
          <div className="absolute inset-0 bg-[#2C332D]/10 z-10 group-hover:bg-transparent transition-colors duration-500" />
          <img 
            src={image} 
            alt="Atmospheric Minecraft Landscape" 
            className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000 ease-out"
          />
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col justify-center">
        <motion.h2 
          initial={{ opacity: 0, x: reverse ? -50 : 50 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-serif text-4xl md:text-6xl text-[#1A211E] mb-6 leading-tight"
        >
          {title}
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-sans text-[#5A635B] leading-loose text-sm md:text-base space-y-4"
        >
          {body}
        </motion.div>
      </div>
    </div>
  );
};

const Philosophy = () => {
    return (
        <section className="py-32 px-6 bg-[#1A211E] text-[#F2F0E9] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                 {/* Abstract geometric pattern simulated with CSS */}
                 <div className="absolute top-[-20%] right-[-10%] w-[60vw] h-[60vw] border border-[#F2F0E9]/20 rounded-full" />
                 <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] border border-[#F2F0E9]/20 rounded-full" />
            </div>

            <div className="max-w-4xl mx-auto text-center relative z-10">
                <Sparkles className="w-8 h-8 mx-auto mb-8 text-emerald-400/70" />
                <h3 className="font-serif text-3xl md:text-5xl mb-12 leading-snug">
                    "ここはゲームサーバーですが、<br/>
                    同時に『デジタルな焚き火』でもあります"
                </h3>
                <div className="grid md:grid-cols-2 gap-12 text-left font-sans text-[#F2F0E9]/70 leading-relaxed">
                    <p>
                        私たちは、壮大な建築物や効率的な自動化装置を求めていません。
                        求めているのは、あなたが今日あったことを話せる場所、
                        あるいは何も話さずにただ隣でブロックを積む静寂です。
                    </p>
                    <p>
                        Discordサーバー "Minecraft Server 🍀" は、
                        日常の喧騒から少しだけ離れたい人々のための
                        隠れ家として機能します。
                        ルールは「他者の平穏を尊重すること」だけ。
                    </p>
                </div>
            </div>
        </section>
    )
}

const FeatureCard = ({ title, desc, icon: Icon, index }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="p-8 border border-[#2C332D]/10 bg-white/40 backdrop-blur-sm rounded-lg hover:bg-white/80 transition-all duration-300"
        >
            <Icon className="w-6 h-6 text-[#4A5D4F] mb-4" />
            <h4 className="font-serif text-xl text-[#1A211E] mb-2">{title}</h4>
            <p className="font-sans text-sm text-[#5A635B] leading-relaxed">{desc}</p>
        </motion.div>
    )
}

const Features = () => (
    <section className="py-24 px-6 bg-[#F2F0E9]">
        <div className="max-w-6xl mx-auto">
             <div className="grid md:grid-cols-3 gap-6">
                <FeatureCard 
                    index={0}
                    icon={Wind}
                    title="Freedom to Be" 
                    desc="ログイン義務も、ボイスチャットの強制もありません。あなたのペースで、あなたの好きな時に、好きなだけ。" 
                />
                <FeatureCard 
                    index={1}
                    icon={Leaf}
                    title="Organic Growth" 
                    desc="街は計画されるのではなく、住人の手によって有機的に広がっていきます。名もなき小道にこそ、物語が宿ります。" 
                />
                <FeatureCard 
                    index={2}
                    icon={MessageCircle}
                    title="Quiet Connection" 
                    desc="Discordは情報の通知場所ではなく、リビングルームです。ゲームをしていない時でも、ふと立ち寄りたくなる場所。" 
                />
             </div>
        </div>
    </section>
)

const FooterCTA = () => {
  return (
    <section id="join" className="h-[80vh] flex flex-col items-center justify-center bg-[#D8D4C5] relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
         {/* Simple noise texture or pattern */}
         <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center px-6"
      >
        <h2 className="font-serif text-5xl md:text-7xl text-[#1A211E] mb-8">
          Ready to settle down?
        </h2>
        <p className="font-sans text-[#5A635B] mb-12 max-w-md mx-auto">
          新しい地図を開く準備はできていますか？<br/>
          クローバーの印を目印に、お待ちしています。
        </p>
        
        <motion.a 
            href="#" // Discord Link Here
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-[#1A211E] text-[#F2F0E9] rounded-full overflow-hidden transition-all shadow-lg hover:shadow-2xl hover:bg-[#2C332D]"
        >
            <span className="relative z-10 font-serif italic text-lg pr-1">Discordに参加</span>
            <span className="relative z-10 bg-white/20 rounded-full p-1 group-hover:rotate-45 transition-transform duration-300">
                <ArrowRight size={16} />
            </span>
        </motion.a>

        <p className="mt-8 text-xs text-[#5A635B]/60 font-sans tracking-widest uppercase">
           Minecraft Server 🍀 • Invite Only • Java Edition
        </p>
      </motion.div>
    </section>
  );
};

// --- Main App ---

export default function MinecraftLP() {
  return (
    <div className="bg-[#F2F0E9] min-h-screen w-full relative selection:bg-[#4A5D4F] selection:text-white">
      <GrainOverlay />
      <Nav />
      
      <main>
        <Hero />
        
        <ContentBlock 
          title="Not Just Blocks." 
          body={
            <>
              <p>建築物は、ただのデータではありません。それは、あなたがそこにいた時間の結晶です。</p>
              <p>誰かが作った橋を渡り、誰かが植えた花畑で休む。言葉を交わさなくても、私たちはつながっています。</p>
            </>
          }
          // Using a placeholder that feels like a calm, shader-enabled Minecraft scene or nature photography
          image="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop" 
        />

        <Features />

        <ContentBlock 
          reverse
          title="Digital Nostalgia." 
          body={
            <>
              <p>子供の頃、秘密基地を作った時のワクワク感を覚えていますか？</p>
              <p>完璧である必要はありません。途中で終わってもいい。歪でもいい。<br/>ここにあるのは、あなたの「好き」という感情だけです。</p>
            </>
          }
          image="https://images.unsplash.com/photo-1518544806352-a2286058e652?q=80&w=2560&auto=format&fit=crop"
        />

        <Philosophy />
        <FooterCTA />
      </main>
    </div>
  );
}