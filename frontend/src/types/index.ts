// ============================================================
// PawsitivePlan — Shared TypeScript Interfaces
// ============================================================

export interface Profile {
  username: string;
  coins: number;
  board_columns: string[];
  created_at: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  level: number;
  experience: number;
  health: number;
  hunger: number;
  thirst: number;
  is_dead: boolean;
  last_updated: string | null;
}

export interface ShopItem {
  id: string;
  name: string;
  type: string;
  price: number;
  image_url: string;
  description?: string;
}

export interface InventoryItem {
  id: string;
  item_id: string;
  quantity: number;
  is_equipped: boolean;
  shop_items: ShopItem;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  is_completed: boolean;
  is_ai_generated: boolean;
  reward_coins: number;
  category: string;
  order_index: number;
  due_date: string | null;
  created_at: string;
  tags?: string[];
  last_completed_at?: string | null;
}

export interface DashboardData {
  pet: Pet;
  profile: Profile;
  inventory: InventoryItem[];
}

export interface AiTaskDraft {
  title: string;
  reward_coins: number;
  category: string;
  tags?: string[];
}
