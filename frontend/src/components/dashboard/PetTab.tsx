"use client";
import { DashboardData } from "@/types";
import { Heart, Utensils, Droplets, Backpack, Sparkles, AlertCircle, Trash2, X } from "lucide-react";
import AnimatedPet from "./AnimatedPet";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface PetTabProps {
  data: DashboardData;
  onClickShop: () => void;
  onFeedPet?: (inventoryId: string) => void;
  isFeeding?: boolean;
  onDeletePet?: () => void;
}

export default function PetTab({ data, onClickShop, onFeedPet, isFeeding, onDeletePet }: PetTabProps) {
  const { pet, inventory } = data;
  const [showInventory, setShowInventory] = useState(false);

  const equippedCosmetics = inventory.filter((i) => i.is_equipped && i.shop_items?.type === "cosmetic").map((i) => i.shop_items);
  const consumables = inventory.filter((i) => i.shop_items?.type !== "cosmetic" && i.shop_items?.type !== "background");

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-gradient-to-b from-base to-crust">
      {/* ── Background Elements ── */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-crust overflow-hidden flex items-center justify-center">
        <video
          src="/asset/background/background-chill.mp4"
          autoPlay
          loop
          playsInline
          className="absolute inset-0 min-w-full min-h-full object-cover opacity-80"
        />
        {/* Soft edge fade to blend smoothly within the tab frame */}
        <div className="absolute inset-0 bg-gradient-to-b from-crust/20 via-transparent to-crust/50 opacity-90" />
      </div>

      {/* ── Pet Canvas ── */}
      <div 
        className="absolute inset-0 z-10 w-full h-full pb-16"
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={(e) => {
          e.preventDefault();
          try {
            const data = JSON.parse(e.dataTransfer.getData("application/json"));
            if (data.action === "feed" && onFeedPet && !isFeeding && !pet.is_dead) {
              onFeedPet(data.itemId);
            }
          } catch (err) {
            // Ignore parse errors safely
          }
        }}
      >
        <AnimatedPet
          pet={pet}
          equippedItems={equippedCosmetics}
        />
      </div>

      {/* ── HUD layer (Heads Up Display) ── */}
      <div className="absolute inset-0 z-20 pointer-events-none p-6 flex flex-col justify-between">

        {/* Top Left: Plaque & Survival Bars */}
        <div className="flex justify-between items-start pointer-events-auto w-full">
          <div className="bg-surface0/80 backdrop-blur-md rounded-2xl border-2 border-surface1 p-4 shadow-xl w-[260px] hover:border-surface2 transition-colors">
            {/* Header */}
            <div className="flex justify-between items-center mb-3 border-b-2 border-surface1 pb-2">
              <div>
                <h2 className="font-black text-mauve text-lg leading-tight truncate">{pet.name || "My Pet"}</h2>
                <p className="text-[10px] text-subtext0 font-black uppercase tracking-widest">{pet.species}</p>
              </div>
              <span className="text-[10px] bg-mauve/20 text-mauve px-2 py-1 rounded uppercase font-black tracking-wider">
                Lv {pet.level}
              </span>
            </div>

            {/* Survival Bars */}
            <div className="flex flex-col gap-2.5">
              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-black uppercase text-red flex items-center gap-1">
                    <Heart size={12} /> Darah
                  </h4>
                  <span className="text-[10px] font-black">{pet.health}/100</span>
                </div>
                <div className="w-full bg-surface1/50 h-2.5 rounded-full overflow-hidden border border-surface2 shadow-inner">
                  <div className="bg-red h-full rounded-full transition-all duration-1000" style={{ width: `${Math.max(0, pet.health)}%` }} />
                </div>
              </div>

              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-black uppercase text-peach flex items-center gap-1">
                    <Utensils size={12} /> Makan
                  </h4>
                  <span className="text-[10px] font-black">{pet.hunger}/100</span>
                </div>
                <div className="w-full bg-surface1/50 h-2.5 rounded-full overflow-hidden border border-surface2 shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-1000 ${pet.hunger < 30 ? "bg-red animate-pulse" : "bg-peach"}`} style={{ width: `${Math.max(0, pet.hunger)}%` }} />
                </div>
              </div>

              <div className="w-full">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-[10px] font-black uppercase text-blue flex items-center gap-1">
                    <Droplets size={12} /> Haus
                  </h4>
                  <span className="text-[10px] font-black">{pet.thirst}/100</span>
                </div>
                <div className="w-full bg-surface1/50 h-2.5 rounded-full overflow-hidden border border-surface2 shadow-inner">
                  <div className={`h-full rounded-full transition-all duration-1000 ${pet.thirst < 30 ? "bg-red animate-pulse" : "bg-blue"}`} style={{ width: `${Math.max(0, pet.thirst)}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Top Right: Inventory Toggle */}
          <button
            onClick={() => setShowInventory(!showInventory)}
            className="bg-surface0/90 backdrop-blur-md hover:bg-surface1 text-text border-2 border-surface2 p-3 rounded-2xl shadow-xl flex items-center gap-2 transition-transform hover:-translate-y-1 group"
          >
            <Backpack size={20} className="text-mauve group-hover:scale-110 transition-transform" />
            <div className="text-left hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-wider text-subtext0 leading-tight">Gudang</p>
            </div>
          </button>
        </div>

        {/* Bottom Area: Trash */}
        <div className="flex justify-end items-end pointer-events-auto">
          <div
            id="trash-can"
            className="w-20 h-20 bg-red/10 border-4 border-dashed border-red/40 text-red rounded-3xl flex flex-col items-center justify-center transition-all shadow-lg opacity-40 hover:opacity-100 hover:scale-110 hover:bg-red/20 hover:border-red"
            title="Tarik Peliharaan Kesini Untuk Dibuang"
          >
            <Trash2 size={24} className="mb-1" />
            <span className="text-[10px] font-black uppercase text-center leading-none px-1">Discard</span>
          </div>
        </div>
      </div>

      {/* ── Inventory Drawer / Overlay ── */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-24 right-6 w-[340px] max-h-[60%] bg-surface0/95 backdrop-blur-xl border-2 border-surface2 rounded-3xl shadow-2xl z-30 flex flex-col pointer-events-auto overflow-hidden text-clip"
          >
            <div className="flex justify-between items-center p-4 border-b-2 border-surface1 bg-surface0/50">
              <h3 className="font-black text-sm text-text flex items-center gap-2">
                <Backpack size={16} className="text-mauve" /> Inventory Barang
              </h3>
              <button
                onClick={() => setShowInventory(false)}
                className="text-subtext0 hover:text-red hover:bg-red/10 p-1.5 rounded-full transition-colors"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto custom-scrollbar">
              {consumables.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  <AnimatePresence>
                    {consumables.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="bg-base/80 border-2 border-surface1 rounded-xl p-2 flex flex-col items-center justify-between text-center relative group shadow-sm hover:border-green hover:shadow-md transition-all"
                      >
                        <div className="w-12 h-12 flex items-center justify-center mb-1">
                          <img
                            src={item.shop_items.image_url}
                            alt={item.shop_items.name}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("application/json", JSON.stringify({ action: "feed", itemId: item.id }));
                              e.dataTransfer.effectAllowed = "move";
                            }}
                            className="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-110 transition-transform pixelated cursor-grab active:cursor-grabbing"
                            style={{ imageRendering: "pixelated" }}
                          />
                        </div>
                        <span className="text-[9px] text-text font-black leading-tight line-clamp-2 h-6 mb-1">
                          {item.shop_items.name}
                        </span>
                        <button
                          onClick={() => onFeedPet && onFeedPet(item.id)}
                          disabled={isFeeding || pet.is_dead}
                          className="w-full bg-green text-crust font-black text-[9px] py-1.5 rounded-lg border-b-2 border-teal active:translate-y-px active:border-b-0 disabled:opacity-50 transition-all uppercase tracking-wider"
                        >
                          Beri
                        </button>
                        <span className="absolute -top-2 -right-2 text-[9px] font-black text-crust bg-yellow w-5 h-5 flex items-center justify-center rounded-full border-2 border-surface0 shadow-sm z-10">
                          {item.quantity}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center text-center text-subtext0 hover:text-blue transition-colors cursor-pointer" onClick={() => { setShowInventory(false); onClickShop(); }}>
                  <Sparkles size={32} className="text-surface2 mb-2" />
                  <p className="text-sm font-black text-text mb-1">Gudang kosong!</p>
                  <p className="text-[10px] font-bold text-blue underline decoration-dotted underline-offset-2">Beli Makanan di Toko</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DEAD OVERLAY */}
      {pet.is_dead && (
        <div className="absolute inset-0 z-50 bg-crust/60 backdrop-blur-sm flex items-center justify-center p-6 text-center pointer-events-auto">
          <div className="bg-surface0 border-4 border-red rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4 max-w-sm">
            <AlertCircle size={64} className="text-red animate-bounce" />
            <div>
              <h3 className="text-3xl font-black text-red mb-2 uppercase tracking-wide">Pet Mati</h3>
              <p className="text-sm font-bold text-subtext0">Peliharaanmu telah tiada karena kelaparan atau kehausan yang fatal.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
