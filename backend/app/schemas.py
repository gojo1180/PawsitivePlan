from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# --- Profiles ---
class ProfileBase(BaseModel):
    username: str
    coins: int = 0

class ProfileCreate(ProfileBase):
    id: UUID  # Typically comes from Supabase Auth

class ProfileUpdate(BaseModel):
    username: Optional[str] = None
    coins: Optional[int] = None

class ProfileResponse(ProfileBase):
    id: UUID
    board_columns: List[str] = ["To Do", "Daily Quest", "Event", "Selesai"]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Tasks ---
class TaskBase(BaseModel):
    title: str
    is_completed: bool = False
    is_ai_generated: bool = False
    reward_coins: int = Field(ge=10, le=30, default=10)
    category: str = "To Do"
    order_index: float = 0.0
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    is_completed: Optional[bool] = None
    reward_coins: Optional[int] = Field(ge=10, le=30, default=None)
    category: Optional[str] = None
    order_index: Optional[float] = None
    due_date: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Pets ---
class PetBase(BaseModel):
    name: str
    species: str
    level: int = 1
    experience: int = 0
    health: int = 100
    hunger: int = 100
    thirst: int = 100
    is_dead: bool = False
    last_updated: Optional[datetime] = None

class PetCreate(PetBase):
    pass

class PetUpdate(BaseModel):
    name: Optional[str] = None
    level: Optional[int] = None
    experience: Optional[int] = None

class PetResponse(PetBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

# --- Shop Items ---
class ShopItemBase(BaseModel):
    name: str
    type: str # e.g., 'food', 'accessory'
    price: int
    image_url: Optional[str] = None

class ShopItemCreate(ShopItemBase):
    pass

class ShopItemUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    price: Optional[int] = None
    image_url: Optional[str] = None

class ShopItemResponse(ShopItemBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

# --- User Inventory ---
class UserInventoryBase(BaseModel):
    quantity: int = 1
    is_equipped: bool = False

class UserInventoryCreate(UserInventoryBase):
    item_id: UUID

class UserInventoryUpdate(BaseModel):
    quantity: Optional[int] = None
    is_equipped: Optional[bool] = None

class UserInventoryResponse(UserInventoryBase):
    id: UUID
    user_id: UUID
    item_id: UUID
    model_config = ConfigDict(from_attributes=True)

# --- Auth ---
class UserRegister(BaseModel):
    email: str
    password: str
    username: str
    species: str

class UserLogin(BaseModel):
    email: str
    password: str

# --- AI Task Generation ---
class GoalRequest(BaseModel):
    goal: str

class AITaskItem(BaseModel):
    title: str
    reward_coins: int = Field(ge=10, le=30)
