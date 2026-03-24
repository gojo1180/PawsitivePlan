"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DropResult } from "@hello-pangea/dnd";
import { fetchApi } from "@/lib/api";
import { DashboardData, Task, AiTaskDraft } from "@/types";
import { DEFAULT_BOARD_COLUMNS, DONE_COLUMN, MIN_TASK_COINS } from "@/lib/constants";

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
  const [manualCategory, setManualCategory] = useState("To Do");
  const [manualDueDate, setManualDueDate] = useState("");

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
      setBoardColumns(petData.profile?.board_columns || [...DEFAULT_BOARD_COLUMNS]);
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
        prev ? { ...prev, profile: { ...prev.profile, coins: res.new_coins_balance } } : prev
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_completed: true, category: DONE_COLUMN } : t))
      );
    } catch {
      alert("Failed to complete task");
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
      alert(msg);
    } finally {
      setIsFeeding(false);
    }
  };

  const discardPet = async () => {
    try {
      await fetchApi("/pets/me", { method: "DELETE" });
      loadDashboard();
    } catch {
      alert("Gagal membuang peliharaan.");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetchApi(`/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      alert("Failed to delete task");
    }
  };

  const clearCompleted = async () => {
    try {
      await fetchApi("/tasks/clear/completed", { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => !t.is_completed));
    } catch {
      alert("Failed to clear tasks");
    }
  };

  const addManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTask) return;
    try {
      const activeColumns = boardColumns.filter((c) => c !== DONE_COLUMN);
      const safeCategory = activeColumns.includes(manualCategory)
        ? manualCategory
        : activeColumns[0] || "To Do";
      const isoDate = manualDueDate ? new Date(manualDueDate).toISOString() : null;

      await fetchApi("/tasks", {
        method: "POST",
        body: JSON.stringify({
          title: manualTask,
          reward_coins: manualReward,
          is_ai_generated: false,
          category: safeCategory,
          due_date: isoDate,
        }),
      });

      setManualTask("");
      setManualReward(MIN_TASK_COINS);
      setManualDueDate("");
      setIsAddingTask(false);
      loadDashboard();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Validasi gagal.";
      alert(`Gagal menambah task: ${msg}`);
    }
  };

  // ─── Board Columns ────────────────────────────────────────────────────────────

  const addColumn = async (newColumnName: string) => {
    if (!newColumnName.trim()) return;
    const coreCols = boardColumns.filter((c) => c !== DONE_COLUMN);
    const newCols = [...coreCols, newColumnName.trim(), DONE_COLUMN];
    setBoardColumns(newCols);
    try {
      await fetchApi("/tasks/board/columns", {
        method: "PATCH",
        body: JSON.stringify({ columns: newCols }),
      });
    } catch { /* silent */ }
  };

  const removeColumn = async (colName: string) => {
    const newCols = boardColumns.filter((c) => c !== colName);
    setBoardColumns(newCols);
    try {
      await fetchApi("/tasks/board/columns", {
        method: "PATCH",
        body: JSON.stringify({ columns: newCols }),
      });
    } catch { /* silent */ }
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
      const defaultCategory = boardColumns.find((c) => c !== DONE_COLUMN) || "To Do";
      setAiTasks(gTasks.map((t: AiTaskDraft) => ({ ...t, category: defaultCategory })));
    } catch {
      alert("Failed to generate AI tasks.");
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
      alert("Failed to save tasks.");
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
    mounted, data, tasks, boardColumns, visibleColumns,
    goal, generating, aiTasks,
    isAddingTask, manualTask, manualReward, manualCategory, manualDueDate,
    isFeeding,
    // Setters
    setGoal, setIsAddingTask,
    setManualTask, setManualReward, setManualCategory, setManualDueDate,
    // Actions
    handleLogout, completeTask, deleteTask, clearCompleted, feedPet, discardPet,
    addManualTask, addColumn, removeColumn, onDragEnd,
    handleGenerateAI, saveAITasks, updateAiTask, removeAiTask,
    toggleColumnVis, clearColumnFilter, loadDashboard,
  };
}
