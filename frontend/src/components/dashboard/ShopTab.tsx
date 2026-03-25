"use client";
/* eslint-disable @next/next/no-img-element */
import { Coins, ShoppingBag, Backpack, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useShop } from "@/hooks/useShop";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { useState } from "react";
import { ShopItem, InventoryItem } from "@/types";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

function ShopItemCard({ item, inventory, onBuy }: { item: ShopItem, inventory: InventoryItem[], onBuy: (id: string, qty: number) => void }) {
  const [qty, setQty] = useState(1);
  const isCosmetic = item.type === "face" || item.type === "head";
  const isOwned = isCosmetic && inventory.some(inv => inv.item_id === item.id);

  return (
    <motion.div
      variants={itemVariants}
      className="bg-surface0 rounded-xl border-2 border-surface1 p-4 pixel-shadow-stepped flex flex-col items-center group relative hover:border-green hover:-translate-y-1 transition-all"
    >
      <div className="w-full aspect-square bg-surface1 rounded-lg mb-4 p-4 border-2 border-dashed border-surface2 relative overflow-hidden flex items-center justify-center group-hover:border-green transition-colors">
        <img
          src={item.image_url}
          alt={item.name}
          className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 pixelated"
          style={{ imageRendering: "pixelated" }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
      </div>
      <h3 className="font-bold text-text text-center mb-1 leading-tight text-sm">{item.name}</h3>
      <p className="text-[10px] text-subtext0 text-center mb-4 line-clamp-2 h-8 leading-tight">
        {item.description}
      </p>

      {!isCosmetic && (
        <div className="flex items-center gap-2 mb-4 bg-surface1 rounded-lg p-1 border border-surface2">
          <button 
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-6 h-6 flex items-center justify-center bg-surface2 rounded text-text hover:bg-surface0 transition-colors"
          >-</button>
          <span className="text-xs font-bold w-4 text-center">{qty}</span>
          <button 
            onClick={() => setQty(qty + 1)}
            className="w-6 h-6 flex items-center justify-center bg-surface2 rounded text-text hover:bg-surface0 transition-colors"
          >+</button>
        </div>
      )}

      <div className="mt-auto w-full pt-2 pb-1">
        <motion.button
          disabled={isOwned}
          whileHover={!isOwned ? { scale: 1.05 } : {}}
          whileTap={!isOwned ? { scale: 0.95 } : {}}
          onClick={() => onBuy(item.id, qty)}
          className={`w-full font-black py-2 rounded-lg border-2 flex justify-center items-center gap-1 text-sm transition-all uppercase tracking-wider ${
            isOwned 
              ? "bg-surface2 text-subtext0 border-surface1 cursor-not-allowed" 
              : "bg-green hover:bg-teal text-crust border-teal border-b-4 active:border-b-2 active:translate-y-[1px]"
          }`}
        >
          {isOwned ? (
            <>Owned</>
          ) : (
            <><Coins size={14} /> {item.price * qty}</>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default function ShopTab() {
  const { profile, shopItems, inventory, loading, handleBuy, handleToggleEquip } = useShop();

  if (loading) return <div className="flex-1 flex items-center justify-center"><LoadingScreen /></div>;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-12">
      {/* ── Market Section ── */}
      <section aria-label="Market">
        <h2 className="pixel-font text-sm text-green mb-6 flex items-center gap-2">
          <ShoppingBag size={28} /> Market
        </h2>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
        >
          {shopItems.map((item) => (
            <ShopItemCard key={item.id} item={item} inventory={inventory} onBuy={handleBuy} />
          ))}
        </motion.div>
      </section>

      {/* ── Inventory Section ── */}
      <section aria-label="My Inventory">
        <h2 className="pixel-font text-sm text-mauve mb-6 flex items-center gap-2">
          <Backpack size={28} /> My Inventory
        </h2>
        {inventory.length === 0 ? (
          <div className="text-center py-16 text-subtext0 bg-surface0 rounded-xl border-2 border-dashed border-surface1 pixel-shadow">
            <p className="font-black text-xl mb-2">Your backpack is empty!</p>
            <p className="text-sm">Buy some cool cosmetics from the market above.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 pb-10"
          >
            <AnimatePresence>
              {inventory.map((inv) => {
                const item = inv.shop_items;
                const isEquipped = inv.is_equipped;
                return (
                  <motion.div
                    variants={itemVariants}
                    key={inv.id}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="bg-surface0 rounded-xl border-2 border-surface1 p-4 pixel-shadow-stepped flex flex-col items-center group relative overflow-hidden border-t-4 border-t-mauve hover:-translate-y-1 transition-all"
                  >
                    {isEquipped && (
                      <div
                        className="absolute top-2 right-2 bg-blue text-crust p-1.5 rounded-md z-10 border-2 border-surface0"
                        title="Equipped!"
                      >
                        <Check size={16} strokeWidth={4} />
                      </div>
                    )}
                    <div className="w-full aspect-square bg-gradient-to-br from-surface1 to-surface0 rounded-lg mb-4 p-4 border-2 border-dashed border-surface2 relative flex items-center justify-center">
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 pixelated"
                        style={{ imageRendering: "pixelated" }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    </div>
                    <div className="flex justify-between w-full items-center mb-3">
                      <h3 className="font-bold text-text text-sm truncate mr-2">{item.name}</h3>
                      <span className="text-xs font-black bg-surface2 px-2 py-1 rounded-md text-subtext1 border-2 border-surface1 shrink-0">
                        x{inv.quantity}
                      </span>
                    </div>
                    <div className="mt-auto w-full pt-2 pb-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleEquip(inv.id)}
                        className={`w-full font-black py-2 rounded-lg flex justify-center items-center gap-1 transition-all text-sm uppercase tracking-wider border-2 ${isEquipped
                            ? "bg-surface2 text-text border-surface1 hover:bg-surface1"
                            : "bg-blue hover:bg-sapphire text-crust border-sapphire border-b-4 active:border-b-2 active:translate-y-[1px]"
                          }`}
                      >
                        {isEquipped ? "Unequip" : <><Sparkles size={14} /> Equip</>}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </section>
    </div>
  );
}
