"use client";
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { Coins, ArrowLeft, ShoppingBag, Backpack, Check, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useShop } from "@/hooks/useShop";
import LoadingScreen from "@/components/ui/LoadingScreen";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1 },
};

export default function ShopPage() {
  const router = useRouter();
  const { profile, shopItems, inventory, loading, handleBuy, handleToggleEquip } = useShop();

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-base p-4 sm:p-8">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex justify-between items-center bg-surface0 p-4 sm:px-8 rounded-3xl border-2 border-surface1 shadow-lg mb-8"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="p-3 bg-surface1 hover:bg-surface2 rounded-xl border-2 border-surface2 transition-colors cursor-pointer group"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={24} className="text-text group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h1 className="font-black text-xl text-text">Item Shop</h1>
            <div className="flex items-center gap-1 text-yellow font-bold text-lg">
              <Coins size={20} /> {profile?.coins ?? 0}
            </div>
          </div>
        </div>
      </motion.header>

      <div className="space-y-12">
        {/* ── Market Section ── */}
        <section aria-label="Market">
          <h2 className="text-3xl font-black text-green mb-6 flex items-center gap-2 drop-shadow-sm">
            <ShoppingBag size={32} /> Market
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
          >
            {shopItems.map((item) => (
              <motion.div
                variants={itemVariants}
                key={item.id}
                className="bg-surface0 rounded-3xl border-2 border-surface1 p-4 shadow-xl flex flex-col items-center group"
              >
                <div className="w-full aspect-square bg-surface1 rounded-2xl mb-4 p-4 border-2 border-dashed border-surface2 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 pixelated"
                    style={{ imageRendering: "pixelated" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <h3 className="font-bold text-text text-center mb-1 leading-tight">{item.name}</h3>
                <p className="text-xs text-subtext0 text-center mb-4 line-clamp-2 h-8 leading-tight">
                  {item.description}
                </p>
                <div className="mt-auto w-full pt-2 pb-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBuy(item.id)}
                    className="w-full bg-green hover:bg-teal text-crust font-black py-2 rounded-xl shadow-md border-b-4 border-teal active:border-b-0 active:translate-y-1 flex justify-center items-center gap-1"
                  >
                    <Coins size={16} /> {item.price}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Inventory Section ── */}
        <section aria-label="My Inventory">
          <h2 className="text-3xl font-black text-mauve mb-6 flex items-center gap-2 drop-shadow-sm">
            <Backpack size={32} /> My Inventory
          </h2>
          {inventory.length === 0 ? (
            <div className="text-center py-16 text-subtext0 bg-surface0 rounded-3xl border-2 border-dashed border-surface1 shadow-inner">
              <p className="font-medium text-xl mb-2">Your backpack is empty!</p>
              <p className="text-sm">Buy some cool cosmetics from the market above.</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6"
            >
              {inventory.map((inv) => {
                const item = inv.shop_items;
                const isEquipped = inv.is_equipped;
                return (
                  <motion.div
                    variants={itemVariants}
                    key={inv.id}
                    className="bg-surface0 rounded-3xl border-2 border-surface1 p-4 shadow-xl flex flex-col items-center group relative overflow-hidden border-t-4 border-t-mauve"
                  >
                    {isEquipped && (
                      <div
                        className="absolute top-2 right-2 bg-blue text-crust p-1.5 rounded-full z-10 shadow-lg border-2 border-surface0"
                        title="Equipped!"
                      >
                        <Check size={16} strokeWidth={4} />
                      </div>
                    )}
                    <div className="w-full aspect-square bg-gradient-to-br from-surface1 to-surface0 rounded-2xl mb-4 p-4 border-2 border-dashed border-surface2 relative flex items-center justify-center">
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
                      <span className="text-xs font-black bg-surface2 px-2 py-1 rounded-md text-subtext1 border border-surface1 shrink-0">
                        x{inv.quantity}
                      </span>
                    </div>
                    <div className="mt-auto w-full pt-2 pb-1">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleToggleEquip(inv.id)}
                        className={`w-full font-black py-2 rounded-xl shadow-md border-b-4 flex justify-center items-center gap-1 transition-all ${
                          isEquipped
                            ? "bg-surface2 text-text border-surface1 hover:bg-surface1 active:border-b-0 active:translate-y-1"
                            : "bg-blue hover:bg-sapphire text-crust border-sapphire active:border-b-0 active:translate-y-1"
                        }`}
                      >
                        {isEquipped ? "Unequip" : <><Sparkles size={16} /> Equip</>}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </section>
      </div>
    </div>
  );
}
