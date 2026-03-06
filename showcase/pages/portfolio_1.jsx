import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Github, Twitter, ArrowUpRight, Mail, Code2, Layers, Cpu } from 'lucide-react';

/**
 * CONFIGURATION & DATA
 * ---------------------
 * Replace these values with your actual data later.
 */
const DATA = {
  name: "YUKI.DEV",
  role: "Creative Frontend Engineer",
  location: "Tokyo, Japan",
  bio: "Crafting digital experiences that merge logic with fluid aesthetics. Exploring the intersection of WebGL, UI design, and interactive storytelling.",
  socials: [
    { name: "GitHub", icon: <Github size={20} />, url: "#" },
    { name: "Twitter", icon: <Twitter size={20} />, url: "#" },
    { name: "Email", icon: <Mail size={20} />, url: "mailto:hello@example.com" },
  ],
  projects: [
    {
      id: 1,
      title: "Nebula Stream",
      category: "WebGL Visualization",
      description: "A real-time data visualization tool using Three.js and React Three Fiber. Processing 10k+ data points with zero latency.",
      tech: ["React", "Three.js", "WebGL"],
      year: "2024",
      image: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" // Placeholder gradient
    },
    {
      id: 2,
      title: "Kinetic UI Kit",
      category: "Design System",
      description: "An open-source component library focusing on physics-based micro-interactions and accessibility.",
      tech: ["TypeScript", "Framer Motion", "Storybook"],
      year: "2023",
      image: "linear-gradient(135deg, #0f0c29 0%, #302b63 100%)"
    },
    {
      id: 3,
      title: "Void Editor",
      category: "SaaS Product",
      description: "Minimalist code editor designed for distraction-free writing. Features distinct dark mode aesthetics.",
      tech: ["Electron", "React", "Rust"],
      year: "2023",
      image: "linear-gradient(135deg, #200122 0%, #6f0000 100%)"
    }
  ]
};

/**
 * COMPONENTS
 */

// Custom Cursor Component
const FluidCursor = () => {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  
  const springConfig = { damping: 25, stiffness: 700 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const moveCursor = (e) => {
      mouseX.set(e.clientX - 16);
      mouseY.set(e.clientY - 16);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => window.removeEventListener("mousemove", moveCursor);
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-cyan-400 pointer-events-none z-50 mix-blend-difference hidden md:block"
      style={{ x, y }}
    />
  );
};

// Background Orb Animation
const BackgroundOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden -z-10 bg-[#02040a]">
      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />
      
      {/* Glowing Orbs */}
      <motion.div 
        animate={{ 
          x: [0, 100, -50, 0], 
          y: [0, -50, 100, 0],
          scale: [1, 1.2, 0.9, 1]
        }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "mirror" }}
        className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/30 rounded-full blur-[100px] mix-blend-screen"
      />
      <motion.div 
        animate={{ 
          x: [0, -100, 50, 0], 
          y: [0, 100, -50, 0],
          scale: [1, 1.1, 0.9, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, repeatType: "mirror" }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-cyan-900/20 rounded-full blur-[120px] mix-blend-screen"
      />
       <motion.div 
        animate={{ 
          x: [0, 50, -50, 0], 
          y: [0, 50, -50, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, repeatType: "mirror" }}
        className="absolute top-[40%] left-[30%] w-[30vw] h-[30vw] bg-lime-900/10 rounded-full blur-[80px] mix-blend-screen"
      />
    </div>
  );
};

const Header = () => (
  <header className="fixed top-0 left-0 w-full p-6 flex justify-between items-center z-40 mix-blend-difference text-white">
    <span className="font-syne font-bold text-xl tracking-tighter">
      {DATA.name}
    </span>
    <nav className="hidden md:flex gap-6 text-sm font-grotesk opacity-70">
      <a href="#work" className="hover:text-cyan-400 transition-colors">WORK</a>
      <a href="#about" className="hover:text-cyan-400 transition-colors">ABOUT</a>
      <a href="#contact" className="hover:text-cyan-400 transition-colors">CONTACT</a>
    </nav>
  </header>
);

const Hero = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);

  return (
    <section className="min-h-screen flex flex-col justify-center px-6 md:px-20 pt-20 relative">
      <div className="max-w-6xl">
        <motion.h1 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="font-syne text-[12vw] leading-[0.85] font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter"
          style={{ y: y1 }}
        >
          FLUID<br />
          <span className="text-cyan-400/80 italic pr-4">DIGITAL</span><br />
          EXPERIENCE
        </motion.h1>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-12 md:mt-24 max-w-xl font-grotesk text-lg md:text-xl text-gray-400 leading-relaxed"
          style={{ y: y2 }}
        >
          <p>{DATA.bio}</p>
        </motion.div>
      </div>
      
      <motion.div 
        className="absolute bottom-10 right-10 hidden md:block"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <svg width="120" height="120" viewBox="0 0 120 120">
          <path id="curve" d="M 60, 60 m -40, 0 a 40,40 0 1,1 80,0 a 40,40 0 1,1 -80,0" fill="transparent"/>
          <text className="text-[10px] font-grotesk fill-white uppercase tracking-widest">
            <textPath href="#curve">
              Scroll Down • Explore Projects • Scroll Down •
            </textPath>
          </text>
        </svg>
      </motion.div>
    </section>
  );
};

const ProjectCard = ({ project, index }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="group relative w-full mb-32 last:mb-0"
    >
      <div className="flex flex-col md:flex-row gap-8 md:gap-20 items-start">
        {/* Visual Number */}
        <span className="font-syne text-6xl text-white/10 hidden md:block">0{project.id}</span>
        
        <div className="w-full">
          {/* Card Content */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-1 transition-all duration-500 hover:bg-white/10 group-hover:border-cyan-500/30">
            <div 
              className="aspect-video w-full rounded-xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity duration-500"
              style={{ background: project.image }}
            />
            
            <div className="px-4 pb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-syne text-3xl md:text-4xl font-bold text-white mb-2">{project.title}</h3>
                  <span className="text-cyan-400 font-grotesk text-sm tracking-widest uppercase">{project.category}</span>
                </div>
                <a href="#" className="p-3 rounded-full bg-white/5 hover:bg-white/20 transition-colors text-white">
                  <ArrowUpRight size={24} />
                </a>
              </div>
              
              <p className="font-grotesk text-gray-400 mb-6 max-w-2xl">{project.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {project.tech.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full border border-white/10 text-xs font-grotesk text-gray-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Projects = () => (
  <section id="work" className="py-32 px-6 md:px-20 relative z-10">
    <div className="max-w-5xl mx-auto">
      {DATA.projects.map((project, index) => (
        <ProjectCard key={project.id} project={project} index={index} />
      ))}
    </div>
  </section>
);

const Footer = () => (
  <footer id="contact" className="py-20 border-t border-white/5 bg-[#02040a] relative z-20">
    <div className="container mx-auto px-6 text-center">
      <h2 className="font-syne text-5xl md:text-7xl font-bold text-white mb-12">
        Let's work <br/> <span className="text-gray-600">together.</span>
      </h2>
      <div className="flex justify-center gap-8 mb-12">
        {DATA.socials.map((s) => (
          <a key={s.name} href={s.url} className="text-white/50 hover:text-cyan-400 transition-colors hover:scale-110 transform">
            {s.icon}
          </a>
        ))}
      </div>
      <p className="font-grotesk text-white/30 text-sm">
        © {new Date().getFullYear()} {DATA.name}. All Rights Reserved.
      </p>
    </div>
  </footer>
);

export default function Portfolio() {
  return (
    <div className="bg-[#02040a] min-h-screen text-white selection:bg-cyan-500/30 selection:text-cyan-100 overflow-x-hidden">
      {/* Dynamic Font Loading */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600&family=Space+Grotesk:wght@300;400;500&family=Syne:wght@400;700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-grotesk { font-family: 'Space Grotesk', sans-serif; }
      `}</style>

      <FluidCursor />
      <BackgroundOrbs />
      <Header />
      
      <main>
        <Hero />
        <Projects />
      </main>
      
      <Footer />
    </div>
  );
}