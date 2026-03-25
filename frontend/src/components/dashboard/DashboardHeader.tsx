"use client";

import { Coins, LogOut, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { DashboardData } from "@/types";

interface DashboardHeaderProps {
  data: DashboardData;
  onLogout: () => void;
}

/**
 * Top navigation bar for the dashboard.
 * Displays user profile stats (coins, XP bar)
 * and a logout button.
 */
export default function DashboardHeader({ data, onLogout }: DashboardHeaderProps) {
  const { pet, profile } = data;
  const xpPercent = pet.experience % 100;

  return (
    <header className="bg-surface0 border-b-4 border-surface2 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-40 sticky top-0 pixel-shadow">
      <div className="flex items-center gap-6">
        {/* App Name Section */}
        <div className="flex items-center gap-2 pr-4 border-r-2 border-surface2">
          <span className="text-2xl">🐾</span>
          <div>
            <h1 className="pixel-font text-sm text-peach leading-none tracking-tight">PawsitivePlan</h1>
            <p className="text-[8px] text-subtext0 font-bold leading-none mt-1.5 uppercase tracking-widest">Gamified Productivity</p>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="font-black text-lg text-mauve tracking-wide flex items-center gap-2">
            {profile.username}
          </h2>
          <div className="flex items-center gap-3 mt-1 cursor-default">
            {/* Coin balance */}
            <div className="flex items-center gap-2 bg-yellow/15 px-4 py-1.5 rounded-lg border-2 border-yellow/30 pixel-shadow">
              <Coins size={16} className="text-yellow" />
              <span className="font-black text-yellow text-sm leading-none">{profile.coins}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          onClick={onLogout}
          className="bg-red/10 text-red border-2 border-red/20 hover:bg-red/20 transition-all px-5 py-2.5 rounded-lg pixel-shadow font-bold flex items-center justify-center gap-2 active:translate-y-[2px] active:shadow-none"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Logout</span>
        </motion.button>
      </div>
    </header>
  );
}
