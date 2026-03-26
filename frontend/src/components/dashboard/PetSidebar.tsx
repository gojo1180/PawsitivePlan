"use client";
/* eslint-disable @next/next/no-img-element */

import { DashboardData } from "@/types";
import { Heart, Utensils, Droplets, Backpack, Sparkles, AlertCircle } from "lucide-react";
import AnimatedPet from "./AnimatedPet";
import { motion, AnimatePresence } from "framer-motion";

interface PetSidebarProps {
  data: DashboardData;
  onClickShop: () => void;
  onFeedPet?: (inventoryId: string) => void;
  isFeeding?: boolean;
  onDeletePet?: () => void;
  onRevivePet?: () => void;
}

export default function PetSidebar({ data, onClickShop, onFeedPet, isFeeding, onDeletePet, onRevivePet }: PetSidebarProps) {
  const { pet, inventory } = data;
  
  // Categorize inventory for equipped cosmetics vs consumables
  const equippedCosmetics = inventory.filter(i => i.is_equipped && i.shop_items?.type === "cosmetic").map(i => i.shop_items);
  const consumables = inventory.filter(i => ["food", "water", "consumable"].includes(i.shop_items?.type || ""));

  return (
    <div className="w-[300px] md:w-[320px] shrink-0 bg-surface0 border-l-4 border-surface1 h-full shadow-[-4px_0_15px_rgba(0,0,0,0.1)] flex flex-col items-center py-6 px-4 relative z-40">
      <div className="w-full flex justify-between items-end mb-4 border-b-2 border-surface1 pb-2">
        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-subtext0 mb-1">Peliharaanku</h3>
        <div className="flex flex-col items-end gap-1 w-20">
          <span className="text-[9px] bg-mauve/20 text-mauve px-1.5 py-0.5 rounded uppercase font-black">
            Lv {pet.level}
          </span>
          <div className="w-full h-[6px] bg-surface1 rounded-full overflow-hidden border border-surface2 shadow-inner" title={`EXP: ${pet.experience}/100`}>
            <div className="h-full bg-yellow transition-all duration-1000" style={{ width: `${Math.max(0, pet.experience)}%` }} />
          </div>
        </div>
      </div>

      <AnimatedPet pet={pet} equippedItems={equippedCosmetics} onClickShop={onClickShop} onDeletePet={onDeletePet} />
      
      <div className="mt-4 text-center w-full">
        <h2 className="font-black text-lg text-mauve">{pet.name || "My Pet"}</h2>
        <p className="text-xs text-subtext0 uppercase tracking-wider font-bold mb-3">{pet.species}</p>

        {/* Survival Bars */}
        <div className="flex flex-col gap-2.5 w-full bg-surface1/50 p-3 rounded-2xl border-2 border-surface2 shadow-inner">
          {/* Health Bar */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-[9px] font-black uppercase text-red flex items-center gap-1">
                <Heart size={10} /> Darah
              </h4>
              <span className="text-[9px] font-black">{pet.health}/100</span>
            </div>
            <div className="w-full bg-surface0 h-2.5 rounded-full overflow-hidden border border-surface2">
              <div
                className="bg-red h-full rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${Math.max(0, pet.health)}%` }}
              />
            </div>
          </div>

          {/* Hunger Bar */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-[9px] font-black uppercase text-peach flex items-center gap-1">
                <Utensils size={10} /> Makan
              </h4>
              <span className="text-[9px] font-black">{pet.hunger}/100</span>
            </div>
            <div className="w-full bg-surface0 h-2.5 rounded-full overflow-hidden border border-surface2">
              <div
                className={`h-full rounded-full transition-all duration-1000 shadow-sm ${pet.hunger < 30 ? "bg-red animate-pulse" : "bg-peach"}`}
                style={{ width: `${Math.max(0, pet.hunger)}%` }}
              />
            </div>
          </div>

          {/* Thirst Bar */}
          <div className="w-full">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-[9px] font-black uppercase text-blue flex items-center gap-1">
                <Droplets size={10} /> Haus
              </h4>
              <span className="text-[9px] font-black">{pet.thirst}/100</span>
            </div>
            <div className="w-full bg-surface0 h-2.5 rounded-full overflow-hidden border border-surface2">
              <div
                className={`h-full rounded-full transition-all duration-1000 shadow-sm ${pet.thirst < 30 ? "bg-red animate-pulse" : "bg-blue"}`}
                style={{ width: `${Math.max(0, pet.thirst)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {pet.is_dead && (
        <div className="absolute inset-0 bg-crust/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 text-center">
          <div className="bg-surface0 border-4 border-red rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4">
            <AlertCircle size={48} className="text-red animate-bounce" />
            <div>
              <h3 className="text-xl font-black text-red mb-2">Peliharaan Mati</h3>
              <p className="text-sm font-bold text-subtext0 mb-4">Peliharaanmu telah mati karena kelaparan atau kehausan.</p>
              <button
                onClick={() => onRevivePet?.()}
                className="text-xs bg-red hover:bg-maroon text-crust font-black py-2 px-4 rounded-xl border-b-4 border-maroon tracking-wider uppercase flex items-center gap-1 mx-auto active:translate-y-1 active:border-b-0 transition-all shadow-lg"
              >
                <Sparkles size={14} /> Hidupkan (100 Koin)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Consumables Inventory */}
      <div className="w-full mt-6 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-black text-xs uppercase tracking-widest text-subtext0 flex items-center gap-1">
            <Backpack size={14} /> Gudang Makanan
          </h3>
          <span className="bg-surface1 text-text text-[10px] px-2 py-0.5 rounded-full font-bold">
            {consumables.length}
          </span>
        </div>
        
        {consumables.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 pb-6">
            <AnimatePresence>
              {consumables.map((item) => (
                <motion.div 
                  key={item.id} 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="bg-base border-2 border-surface1 rounded-2xl p-3 flex flex-col items-center justify-between text-center relative group shadow-sm hover:border-green transition-colors"
                >
                  <img 
                    src={item.shop_items.image_url} 
                    alt={item.shop_items.name} 
                    className="w-12 h-12 object-contain drop-shadow-sm pixelated mb-2 group-hover:scale-110 transition-transform" 
                    style={{ imageRendering: "pixelated" }}
                  />
                  <div className="flex flex-col items-center gap-1 w-full">
                    <span className="text-[10px] text-text font-black leading-tight line-clamp-2 min-h-[24px]">
                      {item.shop_items.name}
                    </span>
                    <button
                      onClick={() => onFeedPet && onFeedPet(item.id)}
                      disabled={isFeeding || pet.is_dead}
                      className="w-full bg-green text-crust font-black text-[10px] py-1.5 rounded-lg border-b-2 border-teal active:translate-y-px active:border-b-0 disabled:opacity-50 transition-all uppercase tracking-wider"
                    >
                      Beri
                    </button>
                  </div>
                  <span className="absolute -top-2 -right-2 text-[10px] font-black text-crust bg-yellow w-6 h-6 flex items-center justify-center rounded-full border-2 border-surface0 shadow-sm z-10">
                    x{item.quantity}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-surface1/50 border-2 border-dashed border-surface2 rounded-2xl p-6 flex flex-col items-center text-center text-subtext0 hover:border-blue transition-colors cursor-pointer group" onClick={onClickShop}>
            <Sparkles size={24} className="text-surface2 mb-2 group-hover:text-blue transition-colors" />
            <p className="text-xs font-bold leading-relaxed">Gudang kosong!</p>
            <p className="text-[10px] mt-1 text-blue underline decoration-dotted underline-offset-2">Beli Makanan di Toko</p>
          </div>
        )}
      </div>
    </div>
  );
}
