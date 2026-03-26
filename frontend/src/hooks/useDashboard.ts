"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DropResult } from "@hello-pangea/dnd";
import { fetchApi } from "@/lib/api";
import { DashboardData, Task, AiTaskDraft } from "@/types";
import { DEFAULT_BOARD_COLUMNS, DONE_COLUMN, MIN_TASK_COINS } from "@/lib/constants";
import { toast } from "react-hot-toast";

export function useDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [boardColumns, setBoardColumns] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // AI Quest state
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiTasks, setAiTasks] = useState<AiTaskDraft[]>([]);

  // Add Task Modal state
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [manualTask, setManualTask] = useState("");
  const [manualReward, setManualReward] = useState(MIN_TASK_COINS);
  const [manualCategory, setManualCategory] = useState("Daily Quest");
  const [manualDueDate, setManualDueDate] = useState("");
  const [manualTags, setManualTags] = useState("");
  const [activeTag, setActiveTag] = useState("");

  // Feed Pet state
  const [isFeeding, setIsFeeding] = useState(false);

  // ─── Data Fetching ───────────────────────────────────────────────────────────

  const loadDashboard = useCallback(async () => {
    try {
      const [petData, tasksData] = await Promise.all([
        fetchApi("/pets/me"),
        fetchApi("/tasks"),
      ]);
      setData(petData);
      setTasks(tasksData);
      setBoardColumns([...DEFAULT_BOARD_COLUMNS]);
    } catch {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }
    const savedVis = localStorage.getItem("visible_columns");
    if (savedVis) setVisibleColumns(JSON.parse(savedVis));
    loadDashboard();
  }, [router, loadDashboard]);

  // ─── Column Visibility ───────────────────────────────────────────────────────

  const toggleColumnVis = (colName: string) => {
    const newVis = visibleColumns.includes(colName)
      ? visibleColumns.filter((c) => c !== colName)
      : [...visibleColumns, colName];
    setVisibleColumns(newVis);
    localStorage.setItem("visible_columns", JSON.stringify(newVis));
  };

  const clearColumnFilter = () => {
    setVisibleColumns([]);
    localStorage.removeItem("visible_columns");
  };

  // ─── Auth ────────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  // ─── Task Actions ─────────────────────────────────────────────────────────────

  const completeTask = async (taskId: string) => {
    try {
      const res = await fetchApi(`/tasks/${taskId}/complete`, { method: "PATCH" });
      setData((prev) =>
        prev ? { 
          ...prev, 
          profile: { ...prev.profile, coins: res.new_coins_balance },
          pet: { 
            ...prev.pet, 
            level: res.new_pet_level ?? prev.pet.level, 
            experience: res.new_pet_experience ?? prev.pet.experience 
          }
        } : prev
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_completed: true, category: DONE_COLUMN } : t))
      );
    } catch {
      toast.error("Failed to complete task");
    }
  };

  const feedPet = async (inventoryId: string) => {
    if (isFeeding) return;
    setIsFeeding(true);
    try {
      await fetchApi(`/pets/feed/${inventoryId}`, { method: "POST" });
      // Reload dashboard entirely to sync up inventory counts and new health/hunger stats
      loadDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memberi makan.";
      toast.error(msg);
    } finally {
      setIsFeeding(false);
    }
  };

  const discardPet = async () => {
    try {
      await fetchApi("/pets/me", { method: "DELETE" });
      loadDashboard();
    } catch {
      toast.error("Gagal membuang peliharaan.");
    }
  };

  const revivePet = async () => {
    try {
      await fetchApi("/pets/revive", { method: "POST" });
      toast.success("Pet berhasil dihidupkan!");
      loadDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menghidupkan pet.";
      toast.error(msg);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetchApi(`/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      toast.error("Failed to delete task");
    }
  };

  const clearCompleted = async () => {
    try {
      await fetchApi("/tasks/clear/completed", { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => !t.is_completed));
    } catch {
      toast.error("Failed to clear tasks");
    }
  };

  const addManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTask) return;
    try {
      const activeColumns = boardColumns.filter((c) => c !== DONE_COLUMN);
      const safeCategory = activeColumns.includes(manualCategory)
        ? manualCategory
        : activeColumns[0] || "Daily Quest";
      const isoDate = manualDueDate ? new Date(manualDueDate).toISOString() : null;

      const parsedTags = manualTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await fetchApi("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: manualTask,
          reward_coins: manualReward,
          is_ai_generated: false,
          category: safeCategory,
          due_date: isoDate,
          tags: parsedTags,
        }),
      });

      // Play add-task sound on successful creation
      try {
        const audio = new Audio("/asset/audio/Tambah_task.mp3");
        audio.play();
      } catch (e) {
        console.error("Audio play failed:", e);
      }

      setManualTask("");
      setManualReward(MIN_TASK_COINS);
      setManualDueDate("");
      setManualTags("");
      setIsAddingTask(false);
      loadDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Validasi gagal.";
      toast.error(`Gagal menambah task: ${msg}`);
    }
  };


  // ─── Drag & Drop ─────────────────────────────────────────────────────────────

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const draggedTask = tasks.find((t) => t.id === draggableId);
    if (!draggedTask) return;

    const newCategory = destination.droppableId;

    if (newCategory === DONE_COLUMN && !draggedTask.is_completed) {
      // Play confirmation sound instantly on drop
      try {
        const audio = new Audio("/asset/audio/confirmation_task.mp3");
        audio.play();
      } catch (e) {
        console.error("Audio play failed:", e);
      }
      completeTask(draggableId);
      return;
    }

    const updatedCompleted =
      source.droppableId === DONE_COLUMN && newCategory !== DONE_COLUMN
        ? false
        : draggedTask.is_completed;

    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggableId
          ? { ...t, category: newCategory, order_index: destination.index, is_completed: updatedCompleted }
          : t
      )
    );

    try {
      await fetchApi(`/tasks/${draggableId}`, {
        method: "PATCH",
        body: JSON.stringify({
          category: newCategory,
          order_index: destination.index,
          is_completed: updatedCompleted,
        }),
      });
    } catch {
      loadDashboard(); // rollback on error
    }
  };

  // ─── AI Quests ────────────────────────────────────────────────────────────────

  const handleGenerateAI = async () => {
    if (!goal) return;
    setGenerating(true);
    try {
      const gTasks = await fetchApi("/api/generate-tasks", {
        method: "POST",
        body: JSON.stringify({ goal }),
      });
      const defaultCategory = boardColumns.find((c) => c !== DONE_COLUMN) || "Daily Quest";
      setAiTasks(gTasks.map((t: AiTaskDraft) => ({ ...t, category: defaultCategory })));
    } catch {
      toast.error("Failed to generate AI tasks.");
    } finally {
      setGenerating(false);
    }
  };

  const saveAITasks = async () => {
    try {
      for (const t of aiTasks) {
        await fetchApi("/tasks", {
          method: "POST",
          body: JSON.stringify({
            title: t.title,
            reward_coins: t.reward_coins,
            is_ai_generated: true,
            category: t.category,
          }),
        });
      }
      setAiTasks([]);
      setGoal("");
      loadDashboard();
    } catch {
      toast.error("Failed to save tasks.");
    }
  };

  const updateAiTask = (index: number, field: string, value: string | number) => {
    setAiTasks((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeAiTask = (index: number) => {
    setAiTasks((prev) => prev.filter((_, i) => i !== index));
  };

  return {
    // State
    mounted, data, tasks, boardColumns, visibleColumns, activeTag,
    goal, generating, aiTasks,
    isAddingTask, manualTask, manualReward, manualCategory, manualDueDate, manualTags,
    isFeeding,
    // Setters
    setGoal, setIsAddingTask, setActiveTag,
    setManualTask, setManualReward, setManualCategory, setManualDueDate, setManualTags,
    // Actions
    handleLogout, completeTask, deleteTask, clearCompleted, feedPet, discardPet, revivePet,
    addManualTask, onDragEnd,
    handleGenerateAI, saveAITasks, updateAiTask, removeAiTask,
    toggleColumnVis, clearColumnFilter, loadDashboard,
  };
}
