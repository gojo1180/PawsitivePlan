"use client";
import { DashboardData, InventoryItem, Pet } from "@/types";
import { Heart, Utensils, Droplets, Backpack, Sparkles, AlertCircle, Trash2, X } from "lucide-react";
import AnimatedPet from "./AnimatedPet";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useCallback } from "react";
import { fetchApi } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PetTabProps {
  data: DashboardData;
  onClickShop: () => void;
  onFeedPet?: (inventoryId: string) => void;
  isFeeding?: boolean;
  onDeletePet?: () => void;
  onRevivePet?: () => void;
  onRefresh?: () => void; // to reload data after equip
}

interface Notification {
  id: number;
  text: string;
  color: string;
}

// ─── Sub: Animated Progress Bar ───────────────────────────────────────────────

function StatBar({
  label,
  value,
  icon,
  color,
  displayValue,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  displayValue: number;
}) {
  const isLow = displayValue < 30;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <h4 className={`text-[10px] font-black uppercase flex items-center gap-1 ${color}`}>
          {icon} {label}
        </h4>
        <motion.span
          key={displayValue}
          initial={{ scale: 1.3, color: "#a6e3a1" }}
          animate={{ scale: 1, color: "inherit" }}
          transition={{ duration: 0.4 }}
          className="text-[10px] font-black"
        >
          {displayValue}/100
        </motion.span>
      </div>
      <div className="w-full bg-surface1/50 h-2.5 rounded-full overflow-hidden border border-surface2 shadow-inner">
        <motion.div
          className={`h-full rounded-full ${isLow ? "animate-pulse" : ""}`}
          style={{ backgroundColor: `var(--color-${color.replace("text-", "")})` }}
          initial={false}
          animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// Item types that can be visually worn on the pet
const WEARABLE_TYPES = ["cosmetic", "head", "face", "body"] as const;
const CONSUMABLE_TYPES = ["food", "water", "consumable"] as const;

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PetTab({ data, onClickShop, onFeedPet, isFeeding, onDeletePet, onRevivePet, onRefresh }: PetTabProps) {
  const { pet, inventory } = data;
  const [showInventory, setShowInventory] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const notifCounter = useRef(0);

  // Optimistic state: local pet stats that can be updated instantly
  const [optimisticPet, setOptimisticPet] = useState<Pet>(pet);
  // Optimistic inventory: track equipped state locally
  const [optimisticInventory, setOptimisticInventory] = useState<InventoryItem[]>(inventory);

  // Sync optimistic state when parent data refreshes
  // Use a ref to avoid stale closures
  const lastPetId = useRef(pet.id);
  if (lastPetId.current !== pet.id || pet.last_updated !== optimisticPet.last_updated) {
    lastPetId.current = pet.id;
    setOptimisticPet(pet);
    setOptimisticInventory(inventory);
  }

  // ALL equipped wearable types — must match WEARABLE_TYPES to be shown on the pet
  const equippedCosmetics = optimisticInventory
    .filter((i) => i.is_equipped && WEARABLE_TYPES.includes(i.shop_items?.type as typeof WEARABLE_TYPES[number]))
    .map((i) => i.shop_items);

  const draggableItems = optimisticInventory.filter(
    (i) => i.shop_items?.type !== "background"
  );

  // ─── Notification helper ────────────────────────────────────────────────────

  const showNotification = useCallback((text: string, color: string) => {
    const id = ++notifCounter.current;
    setNotifications((prev) => [...prev, { id, text, color }]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== id)), 2500);
  }, []);

  // ─── Ghost Drag Image ───────────────────────────────────────────────────────

  const ghostRef = useRef<HTMLDivElement | null>(null);

  const createGhostNode = (imgSrc: string, itemName: string): HTMLDivElement => {
    const ghost = document.createElement("div");
    ghost.style.cssText = `
      position: fixed; top: -9999px; left: -9999px;
      background: rgba(30, 30, 50, 0.85);
      border: 2px solid #a6e3a1;
      border-radius: 16px;
      padding: 12px 16px;
      display: flex; align-items: center; gap: 10px;
      pointer-events: none; z-index: 9999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
      color: white; font-family: sans-serif; font-size: 12px; font-weight: 800;
      backdrop-filter: blur(8px);
    `;
    const img = document.createElement("img");
    img.src = imgSrc;
    img.style.cssText = "width:40px;height:40px;object-fit:contain;image-rendering:pixelated;";
    const label = document.createElement("span");
    label.textContent = itemName;
    ghost.appendChild(img);
    ghost.appendChild(label);
    document.body.appendChild(ghost);
    return ghost;
  };

  // ─── Drop Handler ───────────────────────────────────────────────────────────

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (ghostRef.current) {
      document.body.removeChild(ghostRef.current);
      ghostRef.current = null;
    }

    let payload: { itemId: string; itemType: string; action: string };
    try {
      payload = JSON.parse(e.dataTransfer.getData("application/json"));
    } catch {
      return;
    }

    if (pet.is_dead) {
      showNotification("❌ Pet sudah mati!", "text-red");
      return;
    }

    const { itemId, itemType, action } = payload;
    const item = optimisticInventory.find((i) => i.id === itemId);
    if (!item) return;

    // ── Branch A: Consumable (food, water) ──
    if (action === "feed" || CONSUMABLE_TYPES.includes(itemType as typeof CONSUMABLE_TYPES[number])) {
      if (isFeeding) return;

      // Optimistic update — immediately animate stat bars
      const isFood = itemType === "food" || itemType === "consumable";
      const isWater = itemType === "water";
      setOptimisticPet((prev) => ({
        ...prev,
        hunger: isFood ? Math.min(100, prev.hunger + 30) : prev.hunger,
        thirst: isWater ? Math.min(100, prev.thirst + 40) : prev.thirst,
        health: Math.min(100, prev.health + 5),
      }));
      setOptimisticInventory((prev) =>
        prev
          .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
          .filter((i) => i.quantity > 0)
      );
      showNotification(isFood ? "+30 Kenyang 🍖" : "+40 Segar 💧", "text-green");

      // Call API — revert if it fails
      try {
        await fetchApi(`/pets/feed/${itemId}`, { method: "POST" });
        onRefresh?.();
      } catch {
        // Revert optimistic state
        setOptimisticPet(pet);
        setOptimisticInventory(inventory);
        showNotification("❌ Gagal memberi makan", "text-red");
      }
      return;
    }

    // ── Branch B: Wearable (cosmetic, head, face, body) ──
    if (WEARABLE_TYPES.includes(itemType as typeof WEARABLE_TYPES[number])) {
      const wasEquipped = item.is_equipped;
      // Optimistic: toggle equipped
      setOptimisticInventory((prev) =>
        prev.map((i) =>
          i.id === itemId
            ? { ...i, is_equipped: !wasEquipped }
            : // Unequip same-type items
            i.shop_items?.type === itemType && i.id !== itemId
              ? { ...i, is_equipped: false }
              : i
        )
      );
      showNotification(wasEquipped ? "Kosmetik dilepas ✨" : "Kosmetik dipasang ✨", "text-mauve");

      try {
        await fetchApi(`/pets/equip/${itemId}`, { method: "PATCH" });
        onRefresh?.();
      } catch {
        setOptimisticInventory(inventory);
        showNotification("❌ Gagal mengganti kosmetik", "text-red");
      }
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 w-full h-full relative overflow-hidden bg-gradient-to-b from-base to-crust">
      {/* ── Background ── */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-base overflow-hidden flex items-center justify-center">
        {/* Visual GIF */}
        <img 
          src="/asset/background/backgroundt.gif" 
          alt="nature background" 
          className="w-full h-full object-cover object-bottom pixelated" 
        />
        {/* Background Audio (from mp4) */}
        <video
          src="/asset/background/background-chill-2.mp4"
          autoPlay loop playsInline muted={false}
          className="hidden"
        />
      </div>

      {/* ── Pet Canvas (Drop Zone) ── */}
      <div
        className={`absolute inset-0 z-10 w-full h-full pb-16 transition-all duration-300 ${isDraggingOver ? "bg-mauve/10 backdrop-blur-[2px]" : ""
          }`}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
          setIsDraggingOver(true);
        }}
        onDragLeave={() => setIsDraggingOver(false)}
        onDrop={handleDrop}
      >
        <AnimatedPet pet={optimisticPet} equippedItems={equippedCosmetics} />

        {/* Drop target ring animation */}
        <AnimatePresence>
          {isDraggingOver && (
            <motion.div
              key="drop-ring"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 0.6, scale: 1, rotate: 360 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ rotate: { duration: 12, repeat: Infinity, ease: "linear" }, opacity: { duration: 0.3 }, scale: { duration: 0.3 } }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border-4 border-dashed border-mauve rounded-full pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* ── Floating Notifications ── */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.35 }}
              className={`bg-surface0/90 backdrop-blur-md border border-surface2 px-4 py-2 rounded-full text-sm font-black shadow-lg ${n.color}`}
            >
              {n.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── HUD Layer ── */}
      <div className="absolute inset-0 z-20 pointer-events-none p-6 flex flex-col justify-between">
        {/* Top: Stats card + Toggle */}
        <div className="flex justify-between items-start pointer-events-auto w-full">
          <div className="bg-surface0/90 backdrop-blur-md rounded-xl border-2 border-surface1 p-4 pixel-shadow-stepped w-[260px] hover:border-surface2 transition-colors">
            <div className="flex justify-between items-center mb-3 border-b-2 border-surface1 pb-2">
              <div>
                <h2 className="pixel-font text-[10px] text-mauve leading-tight truncate">{optimisticPet.name || "My Pet"}</h2>
                <p className="text-[10px] text-subtext0 font-black uppercase tracking-widest mt-1">{optimisticPet.species}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5 w-24">
                <span className="pixel-font text-[8px] bg-mauve/20 text-mauve px-2 py-1 rounded-md border border-mauve/30">
                  Lv{optimisticPet.level}
                </span>
                <div className="w-full h-[6px] bg-surface1 rounded-full border border-surface2 overflow-hidden shadow-inner" title={`EXP: ${optimisticPet.experience}/100`}>
                  <div className="h-full bg-yellow transition-all duration-1000" style={{ width: `${Math.max(0, optimisticPet.experience)}%` }} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5">
              <StatBar label="Darah" value={optimisticPet.health} displayValue={optimisticPet.health} icon={<Heart size={12} />} color="text-red" />
              <StatBar label="Makan" value={optimisticPet.hunger} displayValue={optimisticPet.hunger} icon={<Utensils size={12} />} color="text-peach" />
              <StatBar label="Haus" value={optimisticPet.thirst} displayValue={optimisticPet.thirst} icon={<Droplets size={12} />} color="text-blue" />
            </div>
          </div>

          {/* Inventory Toggle */}
          <button
            onClick={() => setShowInventory(!showInventory)}
            className={`backdrop-blur-md text-text border-2 p-4 rounded-xl pixel-shadow flex items-center gap-3 transition-all hover:-translate-y-1 group
              ${showInventory ? "bg-surface1 border-mauve" : "bg-surface0/90 hover:bg-surface1 border-surface2"}`}
          >
            <Backpack size={26} className={`group-hover:scale-110 transition-transform ${showInventory ? "text-mauve" : "text-mauve"}`} />
            <div className="text-left hidden md:block px-1">
              <p className="text-xs font-black uppercase tracking-widest text-subtext0 leading-tight">Gudang</p>
              <p className="text-[9px] text-mauve/70 font-bold">Tarik ke Pet!</p>
            </div>
          </button>
        </div>

        {/* Bottom: Trash */}
        <div className="flex justify-end items-end pointer-events-auto">
          <div
            id="trash-can"
            className="w-20 h-20 bg-red/10 border-4 border-dashed border-red/40 text-red rounded-xl flex flex-col items-center justify-center transition-all opacity-40 hover:opacity-100 hover:scale-110 hover:bg-red/20 hover:border-red cursor-pointer"
            title="Buang Peliharaan"
            onClick={() => onDeletePet?.()}
          >
            <Trash2 size={24} className="mb-1" />
            <span className="text-[10px] font-black uppercase text-center leading-none px-1 tracking-wider">Discard</span>
          </div>
        </div>
      </div>

      {/* ── Inventory Drawer ── */}
      <AnimatePresence>
        {showInventory && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="absolute top-[120px] right-6 w-[420px] max-h-[68%] bg-surface0/97 backdrop-blur-xl border-2 border-surface2 rounded-xl pixel-shadow-lg z-30 flex flex-col pointer-events-auto overflow-hidden"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b-2 border-surface1 bg-surface0/50 shrink-0">
              <h3 className="pixel-font text-[10px] text-text flex items-center gap-2">
                <Backpack size={22} className="text-mauve" /> Inventory
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-mauve/20 text-mauve px-2 py-1 rounded-md font-black border border-mauve/30">
                  Tarik ke Pet untuk pakai
                </span>
                <button
                  onClick={() => setShowInventory(false)}
                  className="text-subtext0 hover:text-red hover:bg-red/10 p-2 rounded-lg transition-colors"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>
            </div>

            {/* Grid */}
            <div className="p-5 overflow-y-auto custom-scrollbar">
              {draggableItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  <AnimatePresence>
                    {draggableItems.map((item) => {
                      const isConsumable = CONSUMABLE_TYPES.includes(item.shop_items.type as typeof CONSUMABLE_TYPES[number]);
                      const accentColor = isConsumable ? "green" : "mauve";

                      return (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                            // Set data payload
                            e.dataTransfer.setData(
                              "application/json",
                              JSON.stringify({
                                action: isConsumable ? "feed" : "equip",
                                itemId: item.id,
                                itemType: item.shop_items.type,
                              })
                            );
                            e.dataTransfer.effectAllowed = "move";

                            // Create custom ghost image
                            const ghost = createGhostNode(item.shop_items.image_url, item.shop_items.name);
                            ghostRef.current = ghost;
                            e.dataTransfer.setDragImage(ghost, 40, 30);
                          }}
                          onDragEnd={() => {
                            if (ghostRef.current) {
                              try { document.body.removeChild(ghostRef.current); } catch { }
                              ghostRef.current = null;
                            }
                          }}
                        >
                          <motion.div
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className={`bg-base/80 border-2 rounded-xl p-3 flex flex-col items-center justify-between text-center relative group pixel-shadow transition-all cursor-grab active:cursor-grabbing select-none
                            ${item.is_equipped ? `ring-2 ring-${accentColor} border-${accentColor}` : "border-surface1"}
                            hover:border-${accentColor} hover:-translate-y-0.5`}
                          >
                            <div className={`w-16 h-16 flex items-center justify-center mb-2 mt-1 rounded-lg bg-surface1/40 transition-colors group-hover:bg-${accentColor}/10`}>
                              <img
                                src={item.shop_items.image_url}
                                alt={item.shop_items.name}
                                className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
                                style={{ imageRendering: "pixelated" }}
                                draggable={false}
                              />
                            </div>
                            <span className="text-xs text-text font-black leading-tight line-clamp-2 mb-2 px-1 min-h-[2rem]">
                              {item.shop_items.name}
                            </span>

                            {/* Quick action button */}
                            {isConsumable ? (
                              <button
                                onClick={(e) => { e.stopPropagation(); onFeedPet?.(item.id); }}
                                disabled={isFeeding || pet.is_dead}
                                className="w-full bg-green text-crust font-black text-xs py-1.5 rounded-lg border-2 border-teal border-b-[3px] active:translate-y-px active:border-b-0 disabled:opacity-40 transition-all uppercase tracking-wider"
                              >
                                {isFeeding ? "..." : "Beri"}
                              </button>
                            ) : (
                              <div className={`w-full text-center text-[10px] font-black py-1.5 rounded-lg uppercase tracking-wider ${item.is_equipped ? "bg-mauve/20 text-mauve" : "bg-surface1 text-subtext0"}`}>
                                {item.is_equipped ? "Dipakai" : "Tarik ke pet"}
                              </div>
                            )}

                            {/* Quantity badge */}
                            <span className="absolute -top-3 -right-3 text-[11px] font-black text-crust bg-yellow w-7 h-7 flex items-center justify-center rounded-md border-2 border-surface0 z-10">
                              {item.quantity}
                            </span>
                          </motion.div>
                        </div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              ) : (
                <div
                  className="py-10 flex flex-col items-center text-center text-subtext0 hover:text-blue transition-colors cursor-pointer"
                  onClick={() => { setShowInventory(false); onClickShop(); }}
                >
                  <Sparkles size={40} className="text-surface2 mb-3" />
                  <p className="text-base font-black text-text mb-1">Gudang kosong!</p>
                  <p className="text-xs font-bold text-blue underline decoration-dotted underline-offset-2">Beli Barang di Toko</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Dead Overlay ── */}
      {pet.is_dead && (
        <div className="absolute inset-0 z-50 bg-crust/60 backdrop-blur-sm flex items-center justify-center p-6 text-center pointer-events-auto">
          <div className="bg-surface0 border-4 border-red rounded-xl p-8 pixel-shadow-lg flex flex-col items-center gap-4 max-w-sm">
            <AlertCircle size={64} className="text-red animate-bounce" />
            <div>
              <h3 className="text-3xl font-black text-red mb-2 uppercase tracking-wider">Pet Mati</h3>
              <p className="text-sm font-bold text-subtext0 mb-4">Peliharaanmu telah tiada karena kelaparan atau kehausan yang fatal.</p>
              <button
                onClick={() => onRevivePet?.()}
                className="bg-red hover:bg-maroon text-crust font-black py-2 px-6 rounded-xl border-b-4 border-maroon tracking-wider uppercase flex items-center gap-2 mx-auto active:translate-y-1 active:border-b-0 transition-all shadow-lg"
              >
                <Sparkles size={18} /> Hidupkan Kembali (100 Koin)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
