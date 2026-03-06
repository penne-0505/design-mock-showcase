import React, { useState, useEffect } from 'react';
import { Github, Twitter, ExternalLink, ArrowUpRight, Mail, Code2, Layers, Zap, Star, MapPin, ArrowRight, Asterisk, Sparkles } from 'lucide-react';

/* Design System: "Refined Warm Glass"
  - Concept: Merging the organic warmth of the previous design with modern glassmorphism.
  - Font Heading: 'Fraunces', serif
  - Font Body: 'Outfit', sans-serif
  - Background: Abstract fluid forms (Unsplash)
*/

const Portfolio = () => {
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(0);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => setScrolled(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Background Image URL (From provided Unsplash link)
  const bgImage = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop";

  // Common Glass Styles - Enhanced for better contrast and edges
  const glassCard = "bg-white/40 backdrop-blur-xl border border-white/60 shadow-lg shadow-black/5 hover:bg-white/60 hover:border-white/80 hover:shadow-xl hover:shadow-black/10 transition-all duration-500 ease-out";
  const darkGlassCard = "bg-[#1A1A1A]/85 backdrop-blur-xl border border-white/10 shadow-lg shadow-black/20 hover:bg-[#1A1A1A]/95 transition-all duration-500 ease-out text-[#FDFBF7]";
  const accentGlassCard = (color) => `bg-${color}-500/10 backdrop-blur-xl border border-${color}-500/20 hover:bg-${color}-500/20 transition-all duration-500 ease-out`;

  const bentoItems = [
    // Row 1: 2 + 1
    {
      id: 'github',
      type: 'social',
      name: 'GitHub',
      label: '@penne-0505',
      url: 'https://github.com/penne-0505',
      icon: Github,
      style: darkGlassCard,
      span: 'md:col-span-2',
      isDark: true
    },
    {
      id: 'twitter',
      type: 'social',
      name: 'X / Twitter',
      label: '@penne_0505',
      url: 'https://x.com/penne_0505',
      icon: Twitter,
      style: glassCard,
      span: 'md:col-span-1',
      isDark: false
    },

    // Row 2: 1 + 2 (Zigzag)
    {
      id: 'proj-2',
      type: 'project',
      title: 'Project Alpha',
      desc: 'Minimal aesthetic exploration.',
      tags: ['React', 'Three.js'],
      color: 'from-orange-500/20 to-orange-100/10',
      icon: Star,
      span: 'md:col-span-1',
    },
    {
      id: 'proj-1',
      type: 'project',
      title: 'otibo System',
      desc: 'Core brand design principles.',
      tags: ['Design', 'System'],
      color: 'from-blue-500/20 to-blue-100/10',
      icon: Layers,
      span: 'md:col-span-2',
    },

    // Row 3: 2 + 1 (Zigzag)
    {
      id: 'proj-3',
      type: 'project',
      title: 'Dev Playground',
      desc: 'Experimental UI components library.',
      tags: ['Vue', 'Tailwind'],
      color: 'from-emerald-500/20 to-emerald-100/10',
      icon: Code2,
      span: 'md:col-span-2',
    },
    {
      id: 'location',
      type: 'widget',
      title: 'Location',
      label: 'Tokyo, Japan',
      icon: MapPin,
      style: glassCard,
      span: 'md:col-span-1',
    },

    // Divider
    {
      id: 'cta-divider',
      type: 'divider',
      span: 'md:col-span-3',
    },

    // Row 4: CTA
    {
      id: 'contact',
      type: 'action',
      title: 'Get in Touch',
      label: 'Start a conversation',
      url: 'mailto:hello@otibo.com',
      icon: Mail,
      style: "bg-[#FF5D2C]/90 backdrop-blur-md text-white hover:bg-[#FF5D2C] border border-white/20 shadow-xl shadow-orange-900/20",
      span: 'md:col-span-3',
    }
  ];

  return (
    <div className="min-h-screen text-[#1A1A1A] font-sans overflow-x-hidden selection:bg-[#FF5D2C] selection:text-white relative">
      {/* Background Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-80 scale-105"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      {/* Background Overlay for readability - Slightly stronger to make text pop */}
      <div className="fixed inset-0 z-0 bg-[#FDFBF7]/85 backdrop-blur-[3px]" />
      
      {/* Grain Overlay */}
      <div className="fixed inset-0 z-50 pointer-events-none opacity-[0.04] mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")` }} 
      />

      {/* Dynamic Font Import & Global Styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,200;300;400;500;600&family=Outfit:wght@300;400;500;600&display=swap');
        
        .font-heading { font-family: 'Fraunces', serif; font-variation-settings: "SOFT" 50, "WONK" 0; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        /* Smooth Scrollbar for Glass */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(26, 26, 26, 0.2); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255, 93, 44, 0.8); }
        
        .animate-enter { animation: enter 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(20px); filter: blur(4px); }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        
        @keyframes enter {
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
      `}</style>

      {/* Floating Glass Header */}
      <nav className={`fixed top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-40 flex justify-between items-center transition-all duration-500 ${scrolled > 20 ? 'translate-y-[-10px]' : ''}`}>
        <div className={`
           flex justify-between items-center w-full max-w-4xl mx-auto px-5 py-2.5 rounded-full transition-all duration-500
           ${scrolled > 20 
             ? 'bg-white/40 backdrop-blur-md border border-white/40 shadow-sm' 
             : 'bg-transparent border border-transparent'}
        `}>
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 bg-[#1A1A1A] text-[#FDFBF7] flex items-center justify-center rounded-full font-heading font-medium text-lg shadow-md group-hover:scale-110 transition-transform duration-300">
              o
            </div>
            <span className={`font-heading font-semibold text-lg tracking-tight transition-opacity duration-300 ${scrolled > 20 ? 'opacity-100' : 'opacity-70'}`}>otibo</span>
          </div>
          <div className="flex gap-4">
            <a href="mailto:hello@otibo.com" className="p-2 hover:bg-black/5 rounded-full transition-colors text-[#1A1A1A]" aria-label="Mail">
              <Mail size={18} />
            </a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 md:pt-40 pb-20 relative z-10">
        
        {/* Hero Section - Condensed & Refined */}
        <section className={`mb-12 md:mb-16 text-center md:text-left ${loaded ? 'animate-enter' : 'opacity-0'}`}>
          <div className="inline-flex items-center px-3 py-1 mb-6 bg-white/30 backdrop-blur-md border border-white/40 rounded-full">
             <span className="w-1.5 h-1.5 rounded-full bg-[#FF5D2C] mr-2"></span>
             <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#1A1A1A]/70">Frontend Engineer / Designer</span>
          </div>
          
          <h1 className="font-heading text-5xl md:text-7xl font-light leading-[1.0] mb-6 tracking-tight text-[#1A1A1A] drop-shadow-sm">
            Hi, I'm <span className="font-normal italic text-transparent bg-clip-text bg-gradient-to-r from-[#FF5D2C] to-[#E04D1F] pr-1">Penne</span>.
          </h1>
          <p className="font-body text-lg md:text-xl text-[#1A1A1A]/70 max-w-lg leading-relaxed font-light mix-blend-multiply">
            Crafting digital experiences under the name <span className="font-medium text-[#1A1A1A]">otibo</span>.<br className="hidden md:block"/>
            Merging refined logic with unpretentious aesthetics.
          </p>
        </section>

        {/* Glass Bento Grid */}
        <section className={`grid grid-cols-1 md:grid-cols-3 gap-5 auto-rows-[minmax(180px,auto)] mb-20 ${loaded ? 'animate-enter delay-100' : 'opacity-0'}`}>
          
          {bentoItems.map((item) => {
            
            // Divider
            if (item.type === 'divider') {
               return (
                <div key={item.id} className={`${item.span} flex items-center gap-4 py-4 px-4 opacity-50`}>
                  <div className="h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/30 to-transparent flex-grow"></div>
                  <Sparkles size={14} className="text-[#1A1A1A]/40" />
                  <div className="h-px bg-gradient-to-r from-transparent via-[#1A1A1A]/30 to-transparent flex-grow"></div>
                </div>
              );
            }

            // Social & Action Cards
            if (item.type === 'social' || item.type === 'action') {
              return (
                <a 
                  key={item.id}
                  href={item.url}
                  target={item.type === 'social' ? "_blank" : undefined}
                  rel={item.type === 'social' ? "noopener noreferrer" : undefined}
                  className={`${item.span} group relative p-8 rounded-3xl flex flex-col justify-between overflow-hidden cursor-pointer ${item.style}`}
                >
                  <div className="flex justify-between items-start z-10">
                    <div className={`${item.type === 'action' ? 'p-3 bg-white/20 backdrop-blur-sm rounded-full' : ''}`}>
                       <item.icon size={item.type === 'action' ? 24 : 28} strokeWidth={1.2} />
                    </div>
                    <ArrowUpRight size={20} className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>
                  
                  <div className={`z-10 ${item.type === 'action' ? 'text-center mt-2' : ''}`}>
                    <span className="block font-heading font-medium text-2xl mb-1">{item.title || item.name}</span>
                    <span className={`font-body text-xs font-medium tracking-wider uppercase ${item.isDark ? 'text-white/60' : 'text-[#1A1A1A]/50'}`}>{item.label}</span>
                  </div>

                  {/* Glass Reflection Effect */}
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </a>
              );
            }

            // Project Cards
            if (item.type === 'project') {
              return (
                <div 
                  key={item.id}
                  className={`${item.span} group relative p-8 rounded-3xl flex flex-col justify-between cursor-pointer transition-all duration-500 hover:-translate-y-1 bg-gradient-to-br ${item.color} backdrop-blur-xl border border-white/50 hover:border-white/70 shadow-lg shadow-black/5 hover:shadow-xl hover:shadow-black/10`}
                >
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded-xl bg-white/50 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-sm text-[#1A1A1A] border border-white/50">
                      <item.icon size={18} />
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white/0 flex items-center justify-center group-hover:bg-white/40 transition-all duration-300">
                      <ArrowRight size={18} className="text-[#1A1A1A]/0 group-hover:text-[#1A1A1A] -translate-x-2 group-hover:translate-x-0 transition-all duration-300" />
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="font-heading text-xl font-semibold mb-2 text-[#1A1A1A]">{item.title}</h3>
                    <p className="font-body text-sm text-[#1A1A1A]/70 mb-4 font-light leading-relaxed">{item.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {item.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 bg-white/40 backdrop-blur-sm border border-white/30 rounded-lg text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/80">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            }

             // Widget Cards
             if (item.type === 'widget') {
              return (
                 <div 
                  key={item.id}
                  className={`${item.span} group relative p-6 rounded-3xl flex flex-col items-center justify-center text-center gap-2 ${item.style}`}
                >
                  <item.icon size={20} className="text-[#FF5D2C] mb-1" />
                  <div>
                    <span className="block font-heading font-bold text-lg text-[#1A1A1A]">{item.label}</span>
                    <span className="font-body text-[10px] opacity-50 uppercase tracking-widest text-[#1A1A1A]">{item.title}</span>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </section>

        {/* Footer */}
        <section className={`text-center py-8 ${loaded ? 'animate-enter delay-200' : 'opacity-0'}`}>
             <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/20">
               <p className="font-body text-[#1A1A1A]/50 text-xs tracking-wider">
                 © {new Date().getFullYear()} otibo / Penne.
               </p>
             </div>
        </section>

      </main>
    </div>
  );
};

export default Portfolio;