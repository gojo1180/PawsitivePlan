"use client";

import Link from "next/link";
import { Sparkles, Target, Coins, Heart, LogIn, UserPlus, Sword, Shield, Scroll } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-base flex flex-col items-center relative overflow-hidden font-sans selection:bg-peach selection:text-crust">
      
      {/* Enhanced Retro Grid Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.07] pointer-events-none" 
        style={{ 
          backgroundImage: `
            linear-gradient(to right, var(--color-text) 1px, transparent 1px),
            linear-gradient(to bottom, var(--color-text) 1px, transparent 1px)
          `, 
          backgroundSize: '40px 40px' 
        }}
      ></div>
      {/* Scanline overlay for extra retro feel */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,1)_50%)] bg-[length:100%_4px]"></div>
      
      {/* Decorative Background Elements */}
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 0.2, y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 left-10 text-mauve select-none pointer-events-none pixelated"
      >
        <Sparkles size={100} strokeWidth={1} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 0.2, y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-40 right-10 text-yellow select-none pointer-events-none pixelated"
      >
        <Coins size={120} strokeWidth={1} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: [0.8, 1, 0.8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 right-20 text-blue select-none pointer-events-none pixelated"
      >
        <Shield size={80} strokeWidth={1} />
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-6 text-center z-10 pt-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center w-full"
        >
          {/* Banner */}
          <motion.div variants={itemVariants} className="bg-surface0 px-6 py-3 border-4 border-text pixel-shadow-stepped mb-12 flex items-center gap-3">
            <Sparkles className="text-yellow" size={18} />
            <span className="text-text font-bold text-[10px] md:text-xs uppercase tracking-widest pixel-font">
              Productivity RPG v1.0
            </span>
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-text tracking-tighter mb-10 leading-tight pixel-font drop-shadow-sm"
          >
            LEVEL UP<br/>
            <span className="text-blue pixel-shadow-blue bg-surface0 px-4 py-2 mt-4 inline-block border-4 border-text">
              YOUR LIFE
            </span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-subtext1 text-lg sm:text-xl max-w-2xl mx-auto mb-16 font-medium leading-relaxed bg-surface0/70 p-6 border-4 border-surface2 border-dotted"
          >
            Turn your mundane to-dos into epic quests. Earn coins, grow your virtual pet, and crush your goals with{" "}
            <span className="text-peach font-black uppercase pixel-font text-[10px] md:text-xs mx-1">
              AI-powered
            </span>{" "}
            breakdown tasks.
          </motion.p>

          {/* Call To Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-8 w-full sm:w-auto items-center">
            <Link href="/register" className="group focus:outline-none w-full sm:w-auto">
              <div className="bg-blue hover:bg-sapphire text-surface0 font-bold text-xs uppercase py-4 px-8 border-4 border-text pixel-btn pixel-shadow flex items-center justify-center gap-3 pixel-font w-full transition-colors">
                <Sword size={20} />
                Start Playing
              </div>
            </Link>

            <Link href="/login" className="group focus:outline-none w-full sm:w-auto">
              <div className="bg-surface0 hover:bg-surface1 text-text font-bold text-xs uppercase py-4 px-8 border-4 border-text pixel-btn pixel-shadow flex items-center justify-center gap-3 pixel-font w-full transition-colors">
                <LogIn size={20} />
                Login
              </div>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full mt-32">
            {/* Card 1 */}
            <div className="bg-surface0 p-8 border-4 border-text pixel-shadow-blue hover:-translate-y-2 hover:pixel-shadow-stepped transition-transform duration-200 group relative text-left pixel-border-top">
              <div className="absolute -top-8 left-6 bg-surface0 text-blue p-3 border-4 border-text pixel-shadow group-hover:pixel-shadow-stepped transition-shadow">
                <Target size={28} />
              </div>
              <h2 className="text-[11px] md:text-xs font-black text-blue mt-6 mb-4 tracking-wider uppercase pixel-font leading-loose">
                AI Quests
              </h2>
              <p className="text-subtext0 font-medium leading-relaxed">
                Enter a big goal and let our AI break it down into bite-sized missions automatically.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-surface0 p-8 border-4 border-text pixel-shadow-peach hover:-translate-y-2 hover:pixel-shadow-stepped transition-transform duration-200 group relative text-left pixel-border-top" style={{"--color-peach": "var(--color-yellow)"} as any}>
              <div className="absolute -top-8 left-6 bg-surface0 text-yellow p-3 border-4 border-text pixel-shadow group-hover:pixel-shadow-stepped transition-shadow">
                <Coins size={28} />
              </div>
              <h2 className="text-[11px] md:text-xs font-black text-yellow mt-6 mb-4 tracking-wider uppercase pixel-font leading-loose">
                Earn Gold
              </h2>
              <p className="text-subtext0 font-medium leading-relaxed">
                Every completed task drops coins. Set bounties and farm gold by being productive.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-surface0 p-8 border-4 border-text pixel-shadow-mauve hover:-translate-y-2 hover:pixel-shadow-stepped transition-transform duration-200 group relative text-left pixel-border-top" style={{"--color-peach": "var(--color-mauve)"} as any}>
              <div className="absolute -top-8 left-6 bg-surface0 text-mauve p-3 border-4 border-text pixel-shadow group-hover:pixel-shadow-stepped transition-shadow">
                <Heart size={28} />
              </div>
              <h2 className="text-[11px] md:text-xs font-black text-mauve mt-6 mb-4 tracking-wider uppercase pixel-font leading-loose">
                Raise Pets
              </h2>
              <p className="text-subtext0 font-medium leading-relaxed">
                Spend your loot in the item shop! Buy cosmetics and outfits for your virtual companion.
              </p>
            </div>
          </motion.div>

          {/* How It Works Section (New Informative Section) */}
          <motion.div variants={itemVariants} className="w-full mt-32 mb-10 text-left">
            <div className="bg-surface0 border-4 border-text pixel-shadow-stepped p-8 md:p-12">
              <div className="flex items-center gap-4 mb-10">
                <Scroll className="text-peach" size={32} />
                <h2 className="text-lg md:text-xl font-black text-text uppercase pixel-font">How to Play</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Step 1 */}
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 bg-surface2 border-4 border-text flex items-center justify-center font-black pixel-font text-xl text-mauve pixel-shadow">1</div>
                  <h3 className="font-bold text-text uppercase pixel-font text-[10px]">Create a Character</h3>
                  <p className="text-subtext1 text-sm leading-relaxed">Sign up and hatch your first companion. They will accompany you on your productivity journey.</p>
                </div>
                
                {/* Step 2 */}
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 bg-surface2 border-4 border-text flex items-center justify-center font-black pixel-font text-xl text-blue pixel-shadow">2</div>
                  <h3 className="font-bold text-text uppercase pixel-font text-[10px]">Set Epic Goals</h3>
                  <p className="text-subtext1 text-sm leading-relaxed">Input your real-life tasks. Use the AI wand to automatically split large goals into smaller, manageable quests.</p>
                </div>
                
                {/* Step 3 */}
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 bg-surface2 border-4 border-text flex items-center justify-center font-black pixel-font text-xl text-yellow pixel-shadow">3</div>
                  <h3 className="font-bold text-text uppercase pixel-font text-[10px]">Loot & Level Up</h3>
                  <p className="text-subtext1 text-sm leading-relaxed">Check off quests to earn EXP and Gold. Use your riches in the shop to buy accessories for your pet!</p>
                </div>

                {/* Connecting Lines (Desktop only) */}
                <div className="hidden md:block absolute top-6 left-16 right-16 h-1 border-t-4 border-dashed border-surface2 -z-10"></div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Enhanced Professional Footer */}
      <footer className="w-full mt-20 bg-surface0 border-t-4 border-text pt-12 pb-6 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 text-left mb-12">
          <div className="col-span-1 md:col-span-2">
            <h3 className="font-black text-text uppercase pixel-font text-xs mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-yellow"/> Pawsitive Plan
            </h3>
            <p className="text-subtext0 text-sm leading-relaxed max-w-sm">
              The ultimate gamified productivity dashboard. Turn your daily chores into an exciting RPG adventure. Stay focused, earn rewards, and raise your virtual companions.
            </p>
          </div>
          
          <div>
            <h3 className="font-black text-text uppercase pixel-font text-[10px] mb-4">Navigation</h3>
            <ul className="flex flex-col gap-3 text-subtext1 text-sm font-medium">
              <li><Link href="/" className="hover:text-blue transition-colors">Home</Link></li>
              <li><Link href="/about" className="hover:text-blue transition-colors">About the Game</Link></li>
              <li><Link href="/shop" className="hover:text-blue transition-colors">Item Shop</Link></li>
              <li><Link href="/leaderboard" className="hover:text-blue transition-colors">Leaderboards</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-black text-text uppercase pixel-font text-[10px] mb-4">Support</h3>
            <ul className="flex flex-col gap-3 text-subtext1 text-sm font-medium">
              <li><Link href="/faq" className="hover:text-peach transition-colors">FAQ & Guide</Link></li>
              <li><Link href="/privacy" className="hover:text-peach transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-peach transition-colors">Terms of Service</Link></li>
              <li><Link href="/contact" className="hover:text-peach transition-colors">Contact Developers</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto border-t-2 border-dashed border-surface2 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-subtext0 font-medium text-[9px] md:text-[10px] uppercase pixel-font tracking-widest">
            © {new Date().getFullYear()} Pawsitive Plan. Hackathon Build.
          </p>
          <div className="flex gap-4 text-subtext0">
            {/* Social placeholder icons */}
            <div className="w-8 h-8 border-2 border-text bg-surface1 flex items-center justify-center hover:bg-blue hover:text-surface0 transition-colors cursor-pointer pixel-shadow">
              <span className="font-bold pixel-font text-[10px]">X</span>
            </div>
            <div className="w-8 h-8 border-2 border-text bg-surface1 flex items-center justify-center hover:bg-mauve hover:text-surface0 transition-colors cursor-pointer pixel-shadow">
              <span className="font-bold pixel-font text-[10px]">DC</span>
            </div>
            <div className="w-8 h-8 border-2 border-text bg-surface1 flex items-center justify-center hover:bg-green hover:text-surface0 transition-colors cursor-pointer pixel-shadow">
              <span className="font-bold pixel-font text-[10px]">GH</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
