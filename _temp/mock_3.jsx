import React, { useState, useEffect, useRef } from 'react';
import { Leaf, MessageCircle, Moon, Sun, Wind, Compass, Users, Camera, ArrowRight, Sparkles } from 'lucide-react';

/* --- Design Philosophy ---
  Theme: "Ethereal Nostalgia & Modern Serenity"
  Unlike typical gaming sites, this evokes the feeling of a calm afternoon 
  reading a book under a tree. It combines the clean structure of a modern SaaS 
  with the texture and warmth of a memory.
*/

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  // Scroll detection for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax / Reveal Effect Hook
  const useIntersectionObserver = (options = {}) => {
    const elementRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      }, { threshold: 0.1, ...options });

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => {
        if (elementRef.current) observer.unobserve(elementRef.current);
      };
    }, []);

    return [elementRef, isVisible];
  };

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C3E36] font-sans selection:bg-[#8CA996] selection:text-white overflow-x-hidden relative">
      
      {/* Global Grain Texture Overlay - Adds analog warmth */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] mix-blend-multiply" 
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
      </div>

      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-700 ${scrolled ? 'bg-[#FDFCF8]/90 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-8'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#3A5245] text-[#FDFCF8] transition-transform group-hover:rotate-12 duration-500">
              <Leaf size={18} fill="#FDFCF8" className="opacity-90" />
            </span>
            <span className={`font-serif text-xl tracking-tight font-medium ${scrolled ? 'text-[#2C3E36]' : 'text-[#2C3E36] mix-blend-difference text-white'}`}>
              Clover.
            </span>
          </div>
          <a href="#" className={`hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${scrolled ? 'bg-[#3A5245] text-white hover:bg-[#2C3E36]' : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'}`}>
            <span>Discordに参加</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative h-screen min-h-[800px] w-full flex items-center justify-center overflow-hidden">
        {/* Background Atmosphere */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1599939571322-792a326991f2?q=80&w=2573&auto=format&fit=crop" 
            alt="Minecraft Landscape Landscape" 
            className="w-full h-full object-cover opacity-90 scale-105 animate-slow-pan"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#FDFCF8]" />
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-xs tracking-widest uppercase mb-8 animate-fade-in-up">
              <Sparkles size={12} />
              <span>Established 2024</span>
            </div>
            
            <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.9] text-[#FDFCF8] mix-blend-overlay mb-8 tracking-tight opacity-0 animate-fade-in-up delay-100">
              あの日見た<br />
              <span className="italic font-light">景色</span>を、もう一度。
            </h1>
            
            <p className="max-w-xl text-lg md:text-xl text-white/90 font-light leading-relaxed mb-12 opacity-0 animate-fade-in-up delay-200 drop-shadow-sm">
              ただブロックを積むだけではない。<br/>
              そこにあるのは、風の音と、誰かの記憶と、<br/>
              あなたの居場所。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 opacity-0 animate-fade-in-up delay-300">
              <button className="px-8 py-4 bg-[#FDFCF8] text-[#2C3E36] rounded-full font-medium transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2 group">
                <MessageCircle size={18} />
                <span>Discordコミュニティへ</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-medium transition-all hover:bg-white/10 flex items-center justify-center gap-2 backdrop-blur-sm">
                <span>ギャラリーを見る</span>
              </button>
            </div>
          </div>
        </div>

        {/* Floating Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/50 animate-bounce-slow">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent mx-auto"></div>
          <span className="text-xs uppercase tracking-widest mt-2 block text-center">Scroll</span>
        </div>
      </header>

      {/* Narrative Section - The "Why" */}
      <Section className="py-32 relative">
        <div className="absolute top-20 right-0 w-1/3 h-full bg-[#E8EFE9] -z-10 rounded-l-[100px] opacity-60" />
        
        <div className="grid md:grid-cols-2 gap-20 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700 ease-out">
              <img src="https://images.unsplash.com/photo-1627856013091-fed6e4e30025?q=80&w=2670&auto=format&fit=crop" alt="Peaceful building" className="object-cover w-full h-full filter sepia-[0.2]" />
              <div className="absolute inset-0 bg-black/10 transition-opacity hover:opacity-0" />
              
              {/* Overlay Badge */}
              <div className="absolute bottom-8 left-8 bg-white/90 backdrop-blur p-4 rounded-lg shadow-sm max-w-[200px]">
                <p className="font-serif text-2xl italic text-[#3A5245]">"Home"</p>
                <p className="text-xs text-gray-500 mt-1">Server Coordinate: -102, 64, 880</p>
              </div>
            </div>
          </div>
          
          <div className="order-1 md:order-2 space-y-8">
            <span className="text-[#8CA996] font-medium tracking-widest uppercase text-sm">Philosophy</span>
            <h2 className="font-serif text-5xl md:text-6xl text-[#2C3E36] leading-tight">
              静寂と自由が<br />交差する場所。
            </h2>
            <p className="text-gray-600 leading-loose text-lg">
              Cloverは、効率を求める場所ではありません。<br/>
              壮大な建築を義務付けられることも、<br/>
              誰かと競い合う必要もありません。
            </p>
            <p className="text-gray-600 leading-loose text-lg">
              ただ、朝日を眺めるためだけにログインする。<br/>
              旅の途中で見つけた花を、誰かの庭に植える。<br/>
              そんな「何気ない物語」を大切にする人たちのための<br/>
              サンクチュアリ（聖域）です。
            </p>
            <div className="pt-4">
              <a href="#" className="inline-block border-b border-[#3A5245] pb-1 text-[#3A5245] hover:text-[#8CA996] hover:border-[#8CA996] transition-colors">
                サーバーのルールを読む
              </a>
            </div>
          </div>
        </div>
      </Section>

      {/* Features - "SaaS" Style but Organic */}
      <Section className="py-24 bg-[#EBECE8]/30">
        <div className="text-center mb-20">
          <h2 className="font-serif text-4xl md:text-5xl text-[#2C3E36] mb-6">Cloverでの暮らし方</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            複雑なシステムはありません。あるのは、快適に過ごすための<br />
            最低限の魔法（プラグイン）と、温かい隣人たちだけ。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Wind size={24} />}
            title="Calm Economy"
            description="インフレのない、穏やかな経済。自分のペースで店を開き、物語のあるアイテムを取引しましょう。"
          />
          <FeatureCard 
            icon={<Compass size={24} />}
            title="Endless Exploration"
            description="資源採取用のワールドと、永住のためのワールドを分離。美しい景観はいつまでも保たれます。"
          />
          <FeatureCard 
            icon={<Users size={24} />}
            title="Mature Society"
            description="参加にはDiscordでの審査があります。このひと手間が、荒らしのいない平和な空間を約束します。"
          />
        </div>
      </Section>

      {/* Gallery - "Memories" */}
      <Section className="py-32 overflow-hidden">
        <div className="flex justify-between items-end mb-16">
          <div>
            <h2 className="font-serif text-5xl text-[#2C3E36] mb-4">記憶の断片</h2>
            <p className="text-gray-500">あるいは、これからあなたが創る景色。</p>
          </div>
          <div className="hidden md:flex gap-2">
            <button className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"><ArrowRight className="rotate-180" size={20}/></button>
            <button className="p-3 rounded-full bg-[#3A5245] text-white hover:bg-[#2C3E36] transition-colors"><ArrowRight size={20}/></button>
          </div>
        </div>

        {/* Masonry-ish Layout */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          <GalleryItem 
            src="https://images.unsplash.com/photo-1627389955681-42e5192243d6?q=80&w=2668&auto=format&fit=crop" 
            caption="The Library at Noon" 
            author="User_A"
            height="h-96"
          />
          <GalleryItem 
            src="https://images.unsplash.com/photo-1590005354167-6da0e76169f0?q=80&w=2600&auto=format&fit=crop" 
            caption="First Settlement" 
            author="Architect_B"
            height="h-64"
          />
          <GalleryItem 
            src="https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=2670&auto=format&fit=crop" 
            caption="Summer Festival 2024" 
            author="Event_Team"
            height="h-80"
          />
          <GalleryItem 
            src="https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2672&auto=format&fit=crop" 
            caption="Quiet Morning" 
            author="Photo_Club"
            height="h-72"
          />
          <div className="bg-[#3A5245] p-8 rounded-lg h-64 flex flex-col justify-center items-center text-center text-white break-inside-avoid">
            <Camera size={48} className="mb-4 opacity-50" />
            <p className="font-serif text-2xl italic mb-2">Your shot here.</p>
            <p className="text-sm opacity-70">あなたの物語を待っています。</p>
          </div>
        </div>
      </Section>

      {/* Seasonal Event / Banner */}
      <div className="w-full bg-[#2C3E36] text-[#E8EFE9] py-20 px-6 relative overflow-hidden">
         {/* Abstract geometric shapes */}
         <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
         <div className="container mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="max-w-xl">
             <div className="flex items-center gap-2 mb-4 text-[#8CA996]">
               <Moon size={18} />
               <span className="uppercase tracking-widest text-xs">Late Night Vibes</span>
             </div>
             <h3 className="font-serif text-3xl md:text-4xl mb-4 leading-snug">
               夜は、焚き火を囲んで。<br/>
               VC（ボイスチャット）で語らう時間。
             </h3>
             <p className="text-white/60 leading-relaxed">
               作業通話も、寝落ち通話も、もちろん無言で聞き専も。<br/>
               心地よい距離感で繋がれるのが、Cloverの魅力です。
             </p>
           </div>
           <div className="flex-shrink-0">
             <div className="w-32 h-32 rounded-full border border-white/20 flex items-center justify-center relative group cursor-pointer hover:bg-white/5 transition-colors">
                <span className="absolute inset-0 rounded-full border border-white/10 animate-ping-slow"></span>
                <span className="font-serif italic text-xl">Join</span>
             </div>
           </div>
         </div>
      </div>

      {/* Footer / CTA */}
      <footer className="bg-[#FDFCF8] pt-32 pb-10 relative">
        <div className="container mx-auto px-6 text-center">
          <Leaf size={40} className="mx-auto text-[#3A5245] mb-8" />
          
          <h2 className="font-serif text-5xl md:text-7xl text-[#2C3E36] mb-8 tracking-tight">
            さあ、新しい日常へ。
          </h2>
          <p className="text-gray-500 mb-12 text-lg">
            Discordコミュニティへの参加は無料です。<br />
            まずは挨拶から始めましょう。
          </p>
          
          <button className="px-10 py-5 bg-[#3A5245] text-[#FDFCF8] rounded-full text-lg font-medium transition-all hover:bg-[#23312B] hover:shadow-xl hover:-translate-y-1 inline-flex items-center gap-3">
            <span>Discordに参加する</span>
            <ArrowRight size={20} />
          </button>

          <div className="mt-32 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>&copy; 2024 Minecraft Server Clover. Not affiliated with Mojang.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-[#3A5245]">Twitter</a>
              <a href="#" className="hover:text-[#3A5245]">Map</a>
              <a href="#" className="hover:text-[#3A5245]">Contact</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Styles for custom animations not in standard Tailwind */}
      <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slow-pan {
          0% { transform: scale(1.05); }
          100% { transform: scale(1.1); }
        }
        .animate-slow-pan {
          animation: slow-pan 20s linear infinite alternate;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animate-ping-slow {
          animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

/* Reusable Components */

const Section = ({ children, className }) => {
  const [ref, isVisible] = useIntersectionObserver();
  return (
    <section 
      ref={ref} 
      className={`container mx-auto px-6 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
    >
      {children}
    </section>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <div className="group p-8 bg-[#FDFCF8] rounded-xl border border-gray-100 hover:border-[#8CA996]/30 hover:shadow-xl hover:shadow-[#8CA996]/5 transition-all duration-500 cursor-default">
    <div className="w-12 h-12 bg-[#F5F7F5] rounded-full flex items-center justify-center text-[#3A5245] mb-6 group-hover:bg-[#3A5245] group-hover:text-white transition-colors duration-500">
      {icon}
    </div>
    <h3 className="font-serif text-2xl text-[#2C3E36] mb-3">{title}</h3>
    <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
  </div>
);

const GalleryItem = ({ src, caption, author, height }) => (
  <div className={`relative group overflow-hidden rounded-lg break-inside-avoid mb-8 ${height}`}>
    <img src={src} alt={caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter contrast-[0.9] brightness-[1.05]" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
      <p className="text-white font-serif text-lg italic">{caption}</p>
      <p className="text-white/60 text-xs uppercase tracking-widest mt-1">Photo by {author}</p>
    </div>
  </div>
);

// Custom Hook helper for observer needs to be defined inside or outside? 
// Defined inside main component for simplicity in single-file requirement.

const useIntersectionObserver = (options = {}) => {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(entry.target); // Trigger once
      }
    }, { threshold: 0.1, ...options });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) observer.unobserve(elementRef.current);
    };
  }, []);

  return [elementRef, isVisible];
};

export default LandingPage;