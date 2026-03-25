"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Profile, ShopItem, InventoryItem } from "@/types";
import { toast } from "react-hot-toast";

export function useShop() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [petData, shopData, invData] = await Promise.all([
        fetchApi("/pets/me"),
        fetchApi("/shop"),
        fetchApi("/shop/inventory"),
      ]);
      setProfile(petData.profile);
      setShopItems(shopData);
      setInventory(invData);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBuy = async (itemId: string, quantity: number = 1) => {
    try {
      await fetchApi(`/shop/buy/${itemId}?quantity=${quantity}`, { method: "POST" });
      toast.success("Purchase successful!");
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to buy item";
      toast.error(msg);
    }
  };

  const handleToggleEquip = async (inventoryId: string) => {
    try {
      await fetchApi(`/pets/equip/${inventoryId}`, { method: "PATCH" });
      loadData();
    } catch {
      toast.error("Failed to equip item");
    }
  };

  return {
    profile,
    shopItems,
    inventory,
    loading,
    handleBuy,
    handleToggleEquip,
  };
}
