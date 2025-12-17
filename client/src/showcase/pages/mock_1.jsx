import React, { useState, useEffect } from 'react';
import { Leaf, MessageCircle, Wind, Map, Star, ArrowRight, Menu, X } from 'lucide-react';

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Scroll detection for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  // UI Components
  const SectionHeading = ({ children, subtitle }) => (
    <div className="mb-12 text-center md:mb-20">
      <span className="block mb-4 text-sm font-medium tracking-widest text-emerald-600 uppercase">
        {subtitle}
      </span>
      <h2 className="text-3xl font-serif font-medium text-stone-800 md:text-5xl leading-tight">
        {children}
      </h2>
    </div>
  );

  const PlaceholderImage = ({ label, height = "h-64" }) => (
    <div className={`relative w-full ${height} overflow-hidden rounded-2xl bg-stone-200 group`}>
      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent z-10" />
      <div className="absolute inset-0 flex items-center justify-center bg-stone-300 animate-pulse text-stone-500">
        <span className="sr-only">Loading...</span>
      </div>
      {/* Simulation of a screenshot placement */}
      <img 
        src="/api/placeholder/800/600" 
        alt={label} 
        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 grayscale-[20%] group-hover:grayscale-0"
        onError={(e) => {
            e.target.style.display = 'none';
            e.target.parentElement.classList.add('flex', 'items-center', 'justify-center', 'text-stone-500', 'font-serif');
            e.target.parentElement.innerHTML = `<span class="z-20">${label}</span><div class="absolute inset-0 bg-stone-300"></div>`;
        }}
      />
      <div className="absolute bottom-4 left-4 z-20 text-white font-medium text-sm md:text-base opacity-90">
        {label}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF8] text-stone-800 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm' : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
              <Leaf size={18} />
            </div>
            <span className={`font-serif font-bold text-lg tracking-tight ${isScrolled ? 'text-stone-800' : 'text-stone-800'}`}>
              Minecraft Server 🍀
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {['Concept', 'Gallery', 'Features'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-sm font-medium text-stone-600 hover:text-emerald-600 transition-colors"
              >
                {item}
              </button>
            ))}
            <button className="px-6 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-full hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
              Discordに参加
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-stone-800" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b border-stone-100 p-6 flex flex-col gap-4 md:hidden shadow-xl animate-fade-in-down">
            {['Concept', 'Gallery', 'Features'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className="text-left text-lg font-medium text-stone-600 py-2"
              >
                {item}
              </button>
            ))}
            <button className="w-full py-3 bg-emerald-600 text-white font-medium rounded-xl">
              Discordに参加
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-2/3 h-full bg-stone-100/50 rounded-l-[100px] transform translate-x-1/4" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium tracking-wide border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Season 4 Now Open
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-medium text-stone-900 leading-[1.1]">
              帰れる場所が、<br />
              <span className="text-emerald-700 italic">ここ</span>にある。
            </h1>
            
            <p className="text-lg text-stone-500 leading-relaxed max-w-md">
              効率を追い求めるだけのゲームは終わりです。<br />
              Minecraft Server 🍀は、何気ない日常と、<br />
              忘れかけていた冒険心を取り戻すための場所。
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="group px-8 py-4 bg-emerald-700 text-white rounded-full font-medium shadow-lg shadow-emerald-900/20 hover:bg-emerald-800 transition-all flex items-center justify-center gap-2">
                Discordに参加する
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-stone-600 border border-stone-200 rounded-full font-medium hover:bg-stone-50 transition-all">
                世界観を見る
              </button>
            </div>
          </div>

          {/* Hero Visual - Composition of "Screenshots" */}
          <div className="relative h-[500px] w-full hidden md:block">
            <div className="absolute top-10 right-10 w-80 h-96 z-20 shadow-2xl rounded-2xl overflow-hidden transform rotate-2 border-4 border-white">
              <PlaceholderImage label="Central Cathedral at Dusk" height="h-full" />
            </div>
            <div className="absolute bottom-20 left-10 w-72 h-64 z-10 shadow-xl rounded-2xl overflow-hidden transform -rotate-3 border-4 border-white">
               <PlaceholderImage label="Cozy Cottage by the Lake" height="h-full" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </header>

      {/* Narrative/Concept Section */}
      <section id="concept" className="py-24 md:py-32 bg-white relative">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 relative">
              <div className="aspect-[4/5] rounded-t-full rounded-b-[200px] overflow-hidden shadow-2xl relative z-10">
                 <PlaceholderImage label="Morning Mist in the Forest" height="h-full" />
              </div>
              {/* Decoration */}
              <div className="absolute -bottom-10 -right-10 text-[12rem] font-serif text-stone-50 opacity-50 select-none pointer-events-none leading-none">
                "
              </div>
            </div>
            
            <div className="md:col-span-1 md:col-start-7" /> {/* Spacer */}

            <div className="md:col-span-5 space-y-8">
              <span className="text-emerald-600 font-medium tracking-widest text-sm">OUR PHILOSOPHY</span>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-800 leading-snug">
                ただのサーバーではない。<br />
                ひとつの「呼吸する世界」。
              </h2>
              <div className="space-y-6 text-stone-600 leading-relaxed font-light">
                <p>
                  私たちのコミュニティは、ゲームクリアを目的としていません。
                  美しい建築、広がる田園風景、そして夜には焚き火を囲んで語り合う時間。
                  そんな「余白」を大切にする人々が集まっています。
                </p>
                <p>
                  初心者から熟練の建築家まで。
                  ここでは誰かに急かされることはありません。
                  あなたのペースで、あなたの物語を紡いでください。
                </p>
              </div>
              
              <div className="pt-4 flex items-center gap-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-serif text-stone-800">3yr+</span>
                  <span className="text-xs text-stone-400 uppercase tracking-wide">History</span>
                </div>
                <div className="w-px h-12 bg-stone-200" />
                <div className="flex flex-col">
                  <span className="text-3xl font-serif text-stone-800">500+</span>
                  <span className="text-xs text-stone-400 uppercase tracking-wide">Residents</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-24 bg-[#F5F4F0]">
        <div className="container mx-auto px-6 md:px-12">
          <SectionHeading subtitle="Captured Moments">
            記憶に残る、<br />美しい瞬間たち
          </SectionHeading>

          {/* Masonry-style Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
            <div className="md:col-span-2 md:row-span-2 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
               <PlaceholderImage label="The Great Library Interior" height="h-full" />
            </div>
            <div className="md:col-span-1 md:row-span-1 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
               <PlaceholderImage label="Market Street" height="h-full" />
            </div>
            <div className="md:col-span-1 md:row-span-1 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
               <PlaceholderImage label="Sakura Valley" height="h-full" />
            </div>
            <div className="md:col-span-1 md:row-span-1 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
               <PlaceholderImage label="Underground Base" height="h-full" />
            </div>
            <div className="md:col-span-2 md:row-span-1 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
               <PlaceholderImage label="Community Event: Summer Festival" height="h-full" />
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-stone-500 text-sm mb-4">
              他にもたくさんの景色が、Discordで共有されています。
            </p>
            <button className="text-emerald-700 font-medium border-b border-emerald-700/30 hover:border-emerald-700 transition-colors pb-0.5">
              ギャラリーをもっと見る
            </button>
          </div>
        </div>
      </section>

      {/* Features/Style Section */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-6 md:px-12">
          <SectionHeading subtitle="Why Join Us">
            心地よさを支える、<br />自由とルールの調和
          </SectionHeading>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              {
                icon: <Wind className="text-emerald-600" size={28} />,
                title: "自由な建築と冒険",
                desc: "過度な制限はありません。景観を守りながら、あなたの感性を自由に表現できる広大な土地が待っています。"
              },
              {
                icon: <MessageCircle className="text-emerald-600" size={28} />,
                title: "穏やかなDiscord",
                desc: "VC必須ではありません。テキストチャット中心の、程よい距離感を保った大人のコミュニティです。"
              },
              {
                icon: <Map className="text-emerald-600" size={28} />,
                title: "バニラ＋αの快適さ",
                desc: "ゲームバランスを壊さない程度に、生活を豊かにするプラグインを導入。経済要素や保護機能も完備。"
              }
            ].map((feature, idx) => (
              <div key={idx} className="group p-8 rounded-3xl bg-stone-50 hover:bg-[#FDFCF8] border border-transparent hover:border-stone-100 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform text-stone-400 group-hover:text-emerald-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-stone-800 mb-3 font-serif">{feature.title}</h3>
                <p className="text-stone-500 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-t border-stone-100">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-2 gap-12">
             <div className="bg-emerald-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Leaf size={120} />
                </div>
                <p className="text-emerald-200 text-sm font-medium tracking-widest mb-6 uppercase">Voice</p>
                <h3 className="text-2xl md:text-3xl font-serif leading-relaxed mb-6">
                  「仕事から帰ってきて、<br/>
                  ただここにログインする。<br/>
                  それだけで癒やされるんです。」
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-200 font-serif">K</div>
                  <div>
                    <div className="font-medium">Kaoru</div>
                    <div className="text-xs text-emerald-400">Member since 2022</div>
                  </div>
                </div>
             </div>
             
             <div className="flex flex-col justify-center pl-0 md:pl-10">
                <h4 className="text-xl font-bold text-stone-800 mb-6">コミュニティの雰囲気</h4>
                <div className="space-y-6">
                  {[
                    "初心者の方にも優しく教えてくれる環境です",
                    "大規模な共同建築プロジェクトも進行中",
                    "定期的な季節イベントが楽しみ"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1 min-w-[20px] text-emerald-500">
                        <Star size={20} fill="currentColor" className="opacity-40" />
                      </div>
                      <p className="text-stone-600 font-light">{item}</p>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-stone-900 text-stone-300 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-900/30 rounded-full blur-3xl"></div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 text-center">
          <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
            新しい物語を、始めよう。
          </h2>
          <p className="text-lg md:text-xl text-stone-400 mb-10 max-w-2xl mx-auto font-light">
            Minecraft Server 🍀 はいつでもあなたを歓迎します。<br />
            まずはDiscordに参加して、私たちの空気を感じてください。
          </p>
          
          <button className="px-10 py-5 bg-emerald-600 text-white text-lg font-bold rounded-full shadow-2xl shadow-emerald-700/40 hover:bg-emerald-500 hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto">
            <MessageCircle size={24} />
            Discordに参加する
          </button>
          
          <p className="mt-8 text-xs text-stone-600">
            参加は無料です。Java版/統合版の対応状況はDiscord内でご確認ください。
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-500 py-12 border-t border-stone-900">
        <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-stone-800 rounded flex items-center justify-center text-stone-400">
              <Leaf size={14} />
            </div>
            <span className="font-serif text-stone-300 font-medium">Minecraft Server 🍀</span>
          </div>
          
          <div className="flex gap-8 text-sm">
            <a href="#" className="hover:text-emerald-500 transition-colors">ルール</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">Wiki</a>
            <a href="#" className="hover:text-emerald-500 transition-colors">お問い合わせ</a>
          </div>

          <div className="text-xs text-stone-700">
            &copy; 2024 Minecraft Server 🍀. All rights reserved.
            <br className="md:hidden"/> Not affiliated with Mojang Studios.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;