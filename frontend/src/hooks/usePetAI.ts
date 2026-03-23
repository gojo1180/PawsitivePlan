import { useState, useEffect, useCallback } from "react";
import { Pet } from "@/types";

export type PetAnimState = "idle" | "walk" | "sleep" | "dead" | "happy" | "eating";

export function usePetAI(pet: Pet) {
  const [internalState, setInternalState] = useState<PetAnimState>("idle");
  const [isHovered, setIsHovered] = useState(false);
  const [chatMessage, setChatMessage] = useState<string>("");

  const animState = pet.is_dead ? "dead" : internalState;

  useEffect(() => {
    if (animState === "dead") return;

    if (isHovered || animState === "happy" || animState === "eating") return;

    // AI Behavior Tree Loop: Evaluates every 4 seconds
    const interval = setInterval(() => {
      const rand = Math.random();
      
      const isWeak = pet.health < 40;

      // Emotion / Chat Logic
      if (pet.is_dead) {
        setChatMessage("");
      } else if (pet.health < 30) {
        setChatMessage("Sakit meow... 🤒");
      } else if (pet.hunger < 30) {
        setChatMessage("Lapar... 🐟");
      } else if (pet.thirst < 30) {
        setChatMessage("Haus... 💧");
      } else {
        // Random chatter
        const chatter = ["Meow!", "Purrr...", "Zzz", "", "", ""];
        setChatMessage(chatter[Math.floor(Math.random() * chatter.length)]);
      }

      if (isWeak && rand < 0.6) {
        setInternalState("sleep");
      } else if (rand < 0.3) {
        setInternalState("walk");
        setTimeout(() => {
          setInternalState((prev) => (prev === "walk" ? "idle" : prev));
        }, 2000);
      } else if (rand < 0.45) {
        setInternalState("sleep");
      } else {
        setInternalState("idle");
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [pet, isHovered, animState]);

  // Pet Interaction (Mouse Click)
  const interact = useCallback(() => {
    if (pet.is_dead) return;
    setInternalState("happy");
    // Play a tiny jump or heart animation
    setTimeout(() => {
      setInternalState("idle");
    }, 1500);
  }, [pet.is_dead]);

  return {
    animState,
    setAnimState: setInternalState,
    setIsHovered,
    interact,
    chatMessage
  };
}
