"use client";

import Link from "next/link";
import { Sparkles, Target, Coins, Heart, LogIn, UserPlus } from "lucide-react";
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
    <div className="min-h-screen bg-base flex flex-col items-center relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.2, rotate: 12 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-10 left-10 text-mauve blur-[1px] select-none pointer-events-none"
      >
        <Sparkles size={120} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, rotate: 0 }}
        animate={{ opacity: 0.2, rotate: -12 }}
        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-20 right-10 text-blue blur-[2px] select-none pointer-events-none"
      >
        <Coins size={150} />
      </motion.div>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center p-6 text-center z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col items-center w-full"
        >
          {/* Banner */}
          <motion.div variants={itemVariants} className="bg-surface0/80 backdrop-blur-md px-6 py-2 rounded-full border-2 border-surface1 mb-8 shadow-lg flex items-center gap-2">
            <Sparkles className="text-yellow animate-pulse" size={20} />
            <span className="text-text font-bold text-sm tracking-wide">
              Welcome to the Ultimate Productivity RPG
            </span>
          </motion.div>

          {/* Hero Title */}
          <motion.h1
            variants={itemVariants}
            className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-mauve to-blue tracking-tighter mb-6 drop-shadow-sm leading-tight"
          >
            Level Up Your Life
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-subtext1 text-xl sm:text-2xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed"
          >
            Turn your mundane to-dos into epic quests. Earn coins, grow your virtual pet, and crush your goals with{" "}
            <span className="text-blue font-black drop-shadow-[0_0_10px_rgba(137,180,250,0.4)]">
              AI-powered
            </span>{" "}
            breakdown tasks.
          </motion.p>

          {/* Call To Action Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link href="/register" className="group focus:outline-none">
              <div className="bg-blue hover:bg-sapphire text-crust font-black text-xl py-4 px-10 rounded-2xl shadow-[0_0_30px_rgba(137,180,250,0.3)] transition-all border-b-8 border-sapphire active:border-b-0 active:translate-y-2 flex items-center justify-center gap-3">
                <UserPlus size={24} className="group-hover:scale-110 transition-transform" />
                Start Playing Free
              </div>
            </Link>

            <Link href="/login" className="group focus:outline-none">
              <div className="bg-surface1 hover:bg-surface2 text-text font-black text-xl py-4 px-10 rounded-2xl shadow-xl transition-all border-b-8 border-surface2 active:border-b-0 active:translate-y-2 flex items-center justify-center gap-3">
                <LogIn size={24} className="group-hover:translate-x-1 transition-transform" />
                Login
              </div>
            </Link>
          </motion.div>

          {/* Features Kanban/Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-24">
            <div className="bg-surface0 rounded-3xl p-8 border-2 border-surface1 hover:border-blue hover:shadow-[0_10px_40px_-10px_rgba(137,180,250,0.3)] transition-all duration-300 group relative text-left">
              <div className="absolute -top-6 left-8 bg-blue text-crust p-3 rounded-2xl shadow-lg border-2 border-surface0 rotate-[-5deg] group-hover:rotate-0 transition-transform duration-300">
                <Target size={32} />
              </div>
              <h2 className="text-2xl font-black text-blue mt-6 mb-3 tracking-wide">AI Quests</h2>
              <p className="text-subtext0 font-medium leading-relaxed">
                Don&apos;t know where to start? Enter a big goal and let Gemini break it down into bite-sized missions automatically.
              </p>
            </div>

            <div className="bg-surface0 rounded-3xl p-8 border-2 border-surface1 hover:border-yellow hover:shadow-[0_10px_40px_-10px_rgba(249,226,175,0.3)] transition-all duration-300 group relative text-left">
              <div className="absolute -top-6 left-8 bg-yellow text-crust p-3 rounded-2xl shadow-lg border-2 border-surface0 rotate-[5deg] group-hover:rotate-0 transition-transform duration-300">
                <Coins size={32} />
              </div>
              <h2 className="text-2xl font-black text-yellow mt-6 mb-3 tracking-wide">Earn Gold</h2>
              <p className="text-subtext0 font-medium leading-relaxed">
                Every real-life task you complete drops coins. Set your own bounties and farm gold by actually being productive.
              </p>
            </div>

            <div className="bg-surface0 rounded-3xl p-8 border-2 border-surface1 hover:border-mauve hover:shadow-[0_10px_40px_-10px_rgba(203,166,247,0.3)] transition-all duration-300 group relative text-left">
              <div className="absolute -top-6 left-8 bg-mauve text-crust p-3 rounded-2xl shadow-lg border-2 border-surface0 rotate-[-5deg] group-hover:rotate-0 transition-transform duration-300">
                <Heart size={32} />
              </div>
              <h2 className="text-2xl font-black text-mauve mt-6 mb-3 tracking-wide">Raise Pets</h2>
              <p className="text-subtext0 font-medium leading-relaxed">
                Spend your loot in the item shop! Buy cosmetics and paper-doll outfits for your virtual companion.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-subtext0 font-medium">
        Made for Hackathon • Gamified Productivity Dashboard
      </footer>
    </div>
  );
}
