"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Filter, Plus, Target, Heart, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";

import { useDashboard } from "@/hooks/useDashboard";
import LoadingScreen from "@/components/ui/LoadingScreen";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import KanbanColumn from "@/components/dashboard/KanbanColumn";
import AddTaskModal from "@/components/dashboard/AddTaskModal";
import AIAssistantSidebar from "@/components/dashboard/AIAssistantSidebar";
import PetTab from "@/components/dashboard/PetTab";
import ShopTab from "@/components/dashboard/ShopTab";
import { DONE_COLUMN } from "@/lib/constants";

const boardVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

type TabType = "quest" | "pet" | "shop";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("quest");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const {
    mounted, data, tasks, boardColumns, visibleColumns, activeTag,
    isAddingTask, manualTask, manualReward, manualCategory, manualDueDate, manualTags,
    isFeeding,
    setIsAddingTask, setActiveTag,
    setManualTask, setManualReward, setManualCategory, setManualDueDate, setManualTags,
    handleLogout, completeTask, deleteTask, clearCompleted, feedPet, discardPet,
    addManualTask, onDragEnd,
    toggleColumnVis, clearColumnFilter, loadDashboard,
  } = useDashboard();

  // Refresh Pet Inventory when switching to Pet Tab
  useEffect(() => {
    if (activeTab === "pet") {
      loadDashboard();
    }
  }, [activeTab, loadDashboard]);

  if (!mounted || !data) return <LoadingScreen />;

  const visibleCols = boardColumns.filter(
    (c) => visibleColumns.length === 0 || visibleColumns.includes(c)
  );

  const uniqueTags = Array.from(
    new Set(tasks.flatMap((t) => t.tags || []))
  ).sort();

  const handleAIManualReload = () => {
    // Force reload via a full page reload or routing refresh to refetch tasks 
    // Since useDashboard doesn't expose a clean refetchTasks yet outside loadDashboard
    window.location.reload();
  };

  return (
    <div className="h-screen bg-base flex flex-col overflow-hidden font-sans">
      {/* ─── Header ───────────────────────────────────────────────────────────── */}
      <DashboardHeader
        data={data}
        onLogout={handleLogout}
      />

      {/* ─── Tabs Bar ───────────────────────────────────────────────────────────── */}
      <div className="border-b-2 border-surface1 bg-surface0 px-6 shrink-0 flex gap-1 z-20 shadow-sm relative z-30">
        <button
          onClick={() => setActiveTab("quest")}
          className={`flex items-center gap-2 px-6 py-3 font-black text-sm uppercase tracking-widest transition-all rounded-t-xl border-t-4 border-x-2 ${activeTab === "quest"
              ? "bg-base text-blue border-t-blue border-x-surface1 -mb-[2px] shadow-sm z-10"
              : "bg-surface0 text-subtext0 border-transparent hover:text-text hover:bg-surface1"
            }`}
        >
          <Target size={18} /> Quest
        </button>
        <button
          onClick={() => setActiveTab("pet")}
          className={`flex items-center gap-2 px-6 py-3 font-black text-sm uppercase tracking-widest transition-all rounded-t-xl border-t-4 border-x-2 ${activeTab === "pet"
              ? "bg-base text-mauve border-t-mauve border-x-surface1 -mb-[2px] shadow-sm z-10"
              : "bg-surface0 text-subtext0 border-transparent hover:text-text hover:bg-surface1"
            }`}
        >
          <Heart size={18} /> Pet
        </button>
        <button
          onClick={() => setActiveTab("shop")}
          className={`flex items-center gap-2 px-6 py-3 font-black text-sm uppercase tracking-widest transition-all rounded-t-xl border-t-4 border-x-2 ${activeTab === "shop"
              ? "bg-base text-green border-t-green border-x-surface1 -mb-[2px] shadow-sm z-10"
              : "bg-surface0 text-subtext0 border-transparent hover:text-text hover:bg-surface1"
            }`}
        >
          <ShoppingBag size={18} /> Shop
        </button>
      </div>

      {/* ─── Main Content Container ────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden bg-base">

        {/* Active Tab Area */}
        <div className="flex-1 flex flex-col min-w-0 relative">

          {/* QUEST TAB */}
          {activeTab === "quest" && (
            <>
              {/* Column Filter Bar */}
              <div className="bg-surface0 border-b border-surface1 px-6 py-3 flex items-center gap-4 overflow-x-auto custom-scrollbar shrink-0 shadow-sm z-10">
                <span className="text-sm font-black text-subtext0 flex items-center gap-2 shrink-0">
                  <Filter size={16} /> Kolom:
                </span>
                <button
                  onClick={clearColumnFilter}
                  className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide transition-all shrink-0 ${visibleColumns.length === 0
                      ? "bg-blue text-crust shadow-md"
                      : "bg-surface1 text-text border border-surface2 hover:border-blue/50"
                    }`}
                >
                  Semua
                </button>
                {boardColumns.map((col) => (
                  <button
                    key={col}
                    onClick={() => toggleColumnVis(col)}
                    className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wide transition-all shrink-0 border border-transparent ${visibleColumns.includes(col)
                        ? "bg-peach text-crust shadow-md"
                        : "bg-surface1 text-text border border-surface2 hover:border-peach/50"
                      }`}
                  >
                    {col}
                  </button>
                ))}

                <div className="h-6 w-px bg-surface2 mx-2" /> {/* Divider */}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-subtext0 flex items-center gap-1 shrink-0">
                    <Filter size={16} /> Tag:
                  </span>
                  <select
                    value={activeTag}
                    onChange={(e) => setActiveTag(e.target.value)}
                    className="bg-surface1 border border-surface2 rounded-xl px-4 py-1.5 text-xs font-bold w-[130px] focus:outline-none focus:border-blue transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Semua Tag</option>
                    {uniqueTags.map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                  </select>
                  {activeTag && (
                    <button onClick={() => setActiveTag("")} className="text-xs font-bold text-red shrink-0 hover:underline">
                      Hapus Tag
                    </button>
                  )}
                </div>

                <div className="h-6 w-px bg-surface2 mx-1" /> {/* Divider */}

                <button
                  onClick={() => setIsAddingTask(true)}
                  className="px-4 py-1.5 rounded-full text-xs font-black tracking-wide transition-all shrink-0 bg-green text-crust shadow-md hover:bg-teal border border-transparent flex items-center gap-1"
                >
                  <Plus size={14} strokeWidth={3} /> Task
                </button>
              </div>

              {/* Kanban Board */}
              <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar bg-base">
                <motion.div
                  variants={boardVariants}
                  initial="hidden"
                  animate="show"
                  className="flex gap-6 h-full min-w-max pb-4 items-start"
                >
                  <DragDropContext onDragEnd={onDragEnd}>
                    {visibleCols.map((colName) => {
                      const colTasks = tasks
                        .filter((t) =>
                          colName === DONE_COLUMN
                            ? t.is_completed
                            : !t.is_completed && t.category === colName
                        )
                        .filter((t) => (activeTag ? t.tags?.some(tag => tag.toLowerCase().includes(activeTag.toLowerCase())) : true))
                        .sort((a, b) => a.order_index - b.order_index);

                      return (
                        <KanbanColumn
                          key={colName}
                          colName={colName}
                          tasks={colTasks}
                          onComplete={completeTask}
                          onDelete={deleteTask}
                          onClearCompleted={clearCompleted}
                          onRemoveColumn={() => { }}
                        />
                      );
                    })}
                  </DragDropContext>
                </motion.div>
              </div>
            </>
          )}

          {/* PET TAB */}
          {activeTab === "pet" && (
            <PetTab
              data={data}
              onClickShop={() => setActiveTab("shop")}
              onFeedPet={feedPet}
              isFeeding={isFeeding}
              onDeletePet={discardPet}
              onRefresh={loadDashboard}
            />
          )}

          {/* SHOP TAB */}
          {activeTab === "shop" && (
            <ShopTab />
          )}

        </div>

        {/* ─── Right SIDEBAR: AI Assistant ──────────────────────────────────────── */}
        <div className={`relative shrink-0 flex transition-all duration-300 ${isAiOpen ? "w-[300px] md:w-[320px]" : "w-0"}`}>

          {/* Toggle Button */}
          <button
            onClick={() => setIsAiOpen(!isAiOpen)}
            className="absolute -left-8 top-1/2 -translate-y-1/2 z-50 bg-surface1 text-text border-y-2 border-l-2 border-surface2 hover:border-blue hover:text-blue w-8 h-16 rounded-l-xl flex items-center justify-center transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.1)] focus:outline-none"
            title={isAiOpen ? "Sembunyikan AI Assistant" : "Tampilkan AI Assistant"}
          >
            {isAiOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          <div className="w-[300px] md:w-[320px] overflow-hidden">
            <AIAssistantSidebar
              boardColumns={boardColumns}
              onTasksSaved={handleAIManualReload}
            />
          </div>
        </div>
      </div>

      {/* Add Task FAB + Modal */}
      <AddTaskModal
        isOpen={isAddingTask}
        manualTask={manualTask}
        manualReward={manualReward}
        manualCategory={manualCategory}
        manualDueDate={manualDueDate}
        manualTags={manualTags}
        boardColumns={boardColumns}
        onClose={() => setIsAddingTask(!isAddingTask)}
        onSubmit={addManualTask}
        onTaskChange={setManualTask}
        onRewardChange={setManualReward}
        onCategoryChange={setManualCategory}
        onDueDateChange={setManualDueDate}
        onTagsChange={setManualTags}
      />
    </div>
  );
}
