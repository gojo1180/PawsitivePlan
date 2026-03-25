"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState, useRef } from "react";
import { ShoppingBag, Heart, Moon } from "lucide-react";
import { Pet, ShopItem } from "@/types";
import { usePetAI } from "@/hooks/usePetAI";
import { motion, AnimatePresence, useMotionValue, useAnimation } from "framer-motion";

interface AnimatedPetProps {
  pet: Pet;
  equippedItems: ShopItem[];
  onClickShop?: () => void;
  onDeletePet?: () => void;
}

export default function AnimatedPet({ pet, equippedItems, onClickShop, onDeletePet }: AnimatedPetProps) {
  const { animState, setIsHovered, interact, chatMessage } = usePetAI(pet);

  const [frame, setFrame] = useState(1);
  const frameRef = useRef(1);
  const lastUpdateRef = useRef(0);
  const reqRef = useRef<number>(0);

  const spriteRef = useRef<HTMLDivElement>(null);
  const [facingRight, setFacingRight] = useState(true);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const controls = useAnimation();

  // Constants
  const isKucing = pet.species.toLowerCase() === "kucing";
  const fps = 8; // Target 8 frames per second
  const frameInterval = 1000 / fps;

  const isIdleLoop = animState === "idle" || animState === "sleep" || animState === "dead" || animState === "happy" || animState === "eating";
  const maxFrames = isIdleLoop ? 8 : 12;

  // Reset frame to 1 when state changes to avoid out-of-bounds sprite requests
  useEffect(() => {
    frameRef.current = 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFrame(1);
  }, [animState]);

  // Professional Game Loop for Sprite Animation
  useEffect(() => {
    const animate = (time: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = time;
      const deltaTime = time - lastUpdateRef.current;

      if (deltaTime > frameInterval) {
        lastUpdateRef.current = time - (deltaTime % frameInterval); // Preserve fractional time

        // Stop animation completely if dead
        if (animState === "dead") {
          frameRef.current = 1;
          setFrame(1);
        } else {
          let nextFrame = frameRef.current + 1;
          if (nextFrame > maxFrames) {
            nextFrame = 1;
          }
          frameRef.current = nextFrame;
          setFrame(nextFrame);
        }
      }

      reqRef.current = requestAnimationFrame(animate);
    };

    reqRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqRef.current);
  }, [frameInterval, maxFrames, animState]);

  // Gravity & Global Boundaries Engine
  useEffect(() => {
    if (!spriteRef.current || pet.is_dead) return;

    if (animState === "walk") {
      const rect = spriteRef.current.getBoundingClientRect();
      const currentX = x.get();
      const screenWidth = typeof window !== "undefined" ? window.innerWidth : 1000;
      const globalLeft = rect.left;

      let targetMove = Math.random() * 400 - 200; // Wander distance

      // Clamp bounds to screen width so it doesn't walk off screen
      if (globalLeft + targetMove < 50) {
        targetMove = Math.abs(targetMove);
      } else if (globalLeft + targetMove > screenWidth - 150) {
        targetMove = -Math.abs(targetMove);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFacingRight(targetMove > 0);
      controls.start({ x: currentX + targetMove, transition: { duration: 2, ease: "linear" } });
    } else if (animState === "idle" || animState === "sleep") {
      // Passive Gravity Check
      const rect = spriteRef.current.getBoundingClientRect();
      const floorY = typeof window !== "undefined" ? window.innerHeight - 120 : 800;
      if (rect.bottom < floorY - 5) {
        const fall = floorY - rect.bottom;
        controls.start({ y: y.get() + fall, transition: { type: "spring", bounce: 0.3 } });
      }
    }
  }, [animState, pet.is_dead, controls, x, y]);

  // Image Source Resolution
  const getSpriteSrc = () => {
    if (isKucing) {
      if (isIdleLoop) return `/asset/karakter/kucing/IDLE/IDLE_${frame}.png`;
      if (animState === "walk") return `/asset/karakter/kucing/walk/WALK${frame}.png`;
    }
    // Fallback for non-cat species
    return `/pets/${pet.species}_${pet.level < 6 ? "bayi" : "dewasa"}.png`;
  };

  const imageSrc = getSpriteSrc();
  const petEmoji = pet.species === "kucing" ? "🐱" : pet.species === "anjing" ? "🐶" : "🐦";

  return (
    <div className="flex flex-col items-center gap-3 w-full h-full">
      <div
        className={`relative w-full h-full flex items-center justify-center shrink-0 transition-colors ${pet.is_dead ? "grayscale opacity-80" : "group"
          }`}
        onClick={!pet.is_dead ? interact : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={pet.is_dead ? "RIP" : "Elus Peliharaanmu!"}
      >
        {/* Fallback emoji background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-sm z-0 pointer-events-none overflow-hidden rounded-[20px]">
          <p className="text-6xl">{petEmoji}</p>
        </div>

        <motion.div
          drag
          dragMomentum={false}
          style={{ x, y, touchAction: "none" }}
          animate={controls}
          whileDrag={{ scale: 1.1, zIndex: 100 }}
          onDragEnd={(e, info) => {
            const el = document.elementFromPoint(info.point.x, info.point.y);
            if (el?.closest("#trash-can")) {
              onDeletePet?.();
              return;
            }
            // Active Gravity Drop
            if (spriteRef.current) {
              const rect = spriteRef.current.getBoundingClientRect();
              const floorY = typeof window !== "undefined" ? window.innerHeight - 120 : 800;
              if (rect.bottom < floorY) {
                const fall = floorY - rect.bottom;
                controls.start({ y: y.get() + fall, transition: { type: "spring", bounce: 0.4 } });
              }
            }
          }}
          className="relative w-32 h-32 md:w-48 md:h-48 z-50 cursor-grab active:cursor-grabbing"
          ref={spriteRef}
        >
          {/* Chat Cloud (Speech Bubble) */}
          <AnimatePresence>
            {chatMessage && !pet.is_dead && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 5, scale: 0.8 }}
                className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface0 border-2 border-surface2 px-3 py-1 rounded-full shadow-lg z-50 whitespace-nowrap pointer-events-none"
              >
                <p className="text-[10px] font-black text-text">{chatMessage}</p>
                {/* Bubble Tail */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-surface0 border-b-2 border-r-2 border-surface2 rotate-45" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Emotion Particles */}
          {animState === "happy" && (
            <div className="absolute -top-2 animate-bounce z-40 text-pink drop-shadow-md">
              <Heart size={24} fill="currentColor" />
            </div>
          )}
          {animState === "sleep" && (
            <div className="absolute top-2 right-4 animate-[pulse_2s_infinite] z-40 text-blue drop-shadow-md">
              <Moon size={20} />
            </div>
          )}

          {/* Pet Sprite Layer */}
          <div
            className={`absolute inset-0 w-full h-full z-10 ${facingRight ? "scale-x-[-1] scale-y-100" : "scale-x-100 scale-y-100"} ${animState === "dead" ? "rotate-90 translate-y-4" : ""
              } ${animState === "happy" ? "animate-[bounce_0.5s_infinite]" : ""}`}
          >
            <img
              src={imageSrc}
              alt={`${pet.name} - ${animState}`}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-auto max-w-none object-contain scale-110 pointer-events-none select-none pixelated"
              onError={(e) => {
                (e.target as HTMLImageElement).style.opacity = "0";
              }}
              style={{ imageRendering: "pixelated", zIndex: 1 }}
            />

            {/* ── Cosmetic Equipment Layers (frame-synced) ── */}
            {equippedItems?.map((item) => {
              // z-index layers: body(2) < cosmetic(3) < face(4) < head(5)
              const zIndex =
                item.type === "body" ? 2 :
                  item.type === "face" ? 4 :
                    item.type === "head" ? 5 :
                /* cosmetic/default */    3;

              // Helper function ONLY injects the frame number into the resolved DB URL.
              const resolveCosmeticUrl = (dbUrl: string, frame: number) => {
                if (!dbUrl) return "";

                // Jika ini Makanan/Minuman, jangan dianimasikan (tidak ada IDLE/WALK)
                if (!dbUrl.includes("/IDLE/") && !dbUrl.includes("/WALK/")) {
                  return dbUrl;
                }

                // Terakhir, pasangkan dengan nomor frame yang sedang berjalan
                // Contoh: .../PIRRATEHAT_WALK1.png -> .../PIRRATEHAT_WALK7.png
                return dbUrl.replace(/\d*\.png$/, `${frame}.png`);
              };

              // --- LOGIKA PEMANGGILANNYA ---
              // Kita ambil data field dari API (menangani API bersarang maupun flat)
              const itemData = (item as any).shop_items || item;

              // Pilih URL dasarnya: if jalan dan ada url walk -> pakai walk. Else pakai idle.
              const baseDbUrl = (animState === "walk" && itemData.image_url_walk)
                ? itemData.image_url_walk
                : itemData.image_url;

              // Panggil fungsinya untuk inject frame
              const cosmeticSrc = baseDbUrl ? resolveCosmeticUrl(baseDbUrl, frame) : "";

              if (!cosmeticSrc) return null;

              return (
                <img
                  key={item.id}
                  src={cosmeticSrc}
                  alt={item.name}
                  // CRITICAL FIX 2.0: Karena ukuran canvas beda (33x32 vs 35x32) tapi tinggi sama (32),
                  // kita kunci tinggi (h-full w-auto), lalu anchor posisinya tepat di tengah bawah.
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-auto max-w-none object-contain scale-110 pointer-events-none select-none pixelated"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.opacity = "0";
                  }}
                  style={{ imageRendering: "pixelated", zIndex }}
                />
              );
            })}
          </div>
        </motion.div>

        {/* Shop hint */}
        {onClickShop && !pet.is_dead && (
          <div
            onClick={(e) => { e.stopPropagation(); onClickShop(); }}
            className="absolute top-2 right-2 bg-crust/50 group-hover:bg-blue/80 text-text group-hover:text-crust p-1.5 rounded-full backdrop-blur-sm transition-all shadow-md cursor-pointer z-30"
            title="Beli Makanan di Toko"
          >
            <ShoppingBag size={14} />
          </div>
        )}
      </div>

      {pet.is_dead && (
        <div className="bg-red/20 border-2 border-red text-red text-[10px] font-black uppercase px-4 py-1.5 rounded-full mt-1">
          Peliharaanmu Telah Tiada
        </div>
      )}
    </div>
  );
}
