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
    <header className="bg-surface0 border-b-4 border-surface1 shadow-sm px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
      <div className="flex items-center gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-black text-xl text-mauve tracking-wide flex items-center gap-2">
            {profile.username}
            <span className="text-[10px] bg-mauve/20 text-mauve px-2 py-1 rounded-md uppercase tracking-widest leading-none">
              Lv. {pet.level} {pet.species}
            </span>
          </h2>

          <div className="flex items-center gap-3 mt-1">
            {/* Coin balance */}
            <div className="flex items-center gap-2 bg-surface1 px-3 py-1.5 rounded-xl border-2 border-surface2">
              <Coins size={16} className="text-yellow" />
              <span className="font-black text-yellow text-sm leading-none">{profile.coins}</span>
            </div>

            {/* XP progress bar */}
            <div className="flex items-center gap-2 bg-surface1 px-3 py-1.5 rounded-xl border-2 border-surface2 min-w-[120px]">
              <Sparkles size={16} className="text-blue shrink-0" />
              <div className="w-full bg-surface2 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue h-full rounded-full transition-all duration-1000"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          onClick={onLogout}
          className="bg-red/10 text-red border-2 border-red/20 hover:bg-red hover:text-crust transition-colors px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2"
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
