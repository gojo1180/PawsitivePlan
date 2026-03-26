"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Plus, Target, Heart, ShoppingBag, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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
    handleLogout, completeTask, deleteTask, clearCompleted, feedPet, discardPet, revivePet,
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
      <div className="bg-surface0 border-b-4 border-surface2 px-6 py-2 shrink-0 flex gap-2 sm:gap-3 z-30">
        <button
          onClick={() => setActiveTab("quest")}
          className={`flex items-center gap-2 px-5 py-2.5 pixel-font text-[10px] uppercase transition-all rounded-lg border-2 ${activeTab === "quest"
              ? "bg-blue/15 text-blue border-blue/30 pixel-shadow-blue"
              : "text-subtext0 border-transparent hover:text-text hover:bg-surface1/50 hover:border-surface2"
            }`}
        >
          <Target size={18} /> Quest
        </button>
        <button
          onClick={() => setActiveTab("pet")}
          className={`flex items-center gap-2 px-5 py-2.5 pixel-font text-[10px] uppercase transition-all rounded-lg border-2 ${activeTab === "pet"
              ? "bg-mauve/15 text-mauve border-mauve/30 pixel-shadow-mauve"
              : "text-subtext0 border-transparent hover:text-text hover:bg-surface1/50 hover:border-surface2"
            }`}
        >
          <Heart size={18} /> Pet
        </button>
        <button
          onClick={() => setActiveTab("shop")}
          className={`flex items-center gap-2 px-5 py-2.5 pixel-font text-[10px] uppercase transition-all rounded-lg border-2 ${activeTab === "shop"
              ? "bg-green/15 text-green border-green/30 pixel-shadow-green"
              : "text-subtext0 border-transparent hover:text-text hover:bg-surface1/50 hover:border-surface2"
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
              <div className="bg-surface0 border-b-2 border-surface1 px-6 py-3 flex items-center gap-3 overflow-x-auto custom-scrollbar shrink-0 z-10">
                <span className="text-sm font-black text-subtext0 flex items-center gap-2 shrink-0 uppercase tracking-wider">
                  <Filter size={16} /> Kolom:
                </span>
                <button
                  onClick={clearColumnFilter}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border-2 ${visibleColumns.length === 0
                      ? "bg-text text-base border-text pixel-shadow"
                      : "bg-surface1 text-subtext0 border-surface2 hover:border-text/30"
                    }`}
                >
                  Semua
                </button>
                {boardColumns.map((col) => (
                  <button
                    key={col}
                    onClick={() => toggleColumnVis(col)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border-2 ${visibleColumns.includes(col)
                        ? "bg-peach/15 text-peach border-peach/30 pixel-shadow"
                        : "bg-surface1 text-subtext0 border-surface2 hover:border-peach/30"
                      }`}
                  >
                    {col}
                  </button>
                ))}

                <div className="h-6 w-px bg-surface2 mx-2" /> {/* Divider */}

                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-subtext0 flex items-center gap-1 shrink-0 uppercase tracking-wider">
                    <Filter size={16} /> Tag:
                  </span>
                  <select
                    value={activeTag}
                    onChange={(e) => setActiveTag(e.target.value)}
                    className="bg-surface1 border-2 border-surface2 rounded-lg px-4 py-1.5 text-xs font-bold w-[130px] focus:outline-none focus:border-blue transition-colors appearance-none cursor-pointer"
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
                  className="px-5 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shrink-0 bg-green text-crust border-2 border-teal border-b-4 active:border-b-2 active:translate-y-[1px] flex items-center gap-1"
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
              onRevivePet={revivePet}
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

          {/* New Prominent CTA Toggle */}
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center">
            <AnimatePresence mode="wait">
              {!isAiOpen ? (
                <motion.button
                  key="open"
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  whileHover={{ scale: 1.1, x: -5 }}
                  onClick={() => setIsAiOpen(true)}
                  className="bg-surface1 text-blue border-2 border-blue/30 p-3 rounded-2xl shadow-lg pixel-shadow-blue flex flex-col items-center gap-1 group hover:bg-blue/10 transition-colors"
                  title="Ask AI Assistant"
                >
                  <motion.div
                    animate={{ rotate: [0, 15, -15, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  >
                    <Sparkles size={24} className="group-hover:text-blue" />
                  </motion.div>
                  <span className="pixel-font text-[8px] writing-vertical uppercase tracking-widest mt-1">AI</span>
                </motion.button>
              ) : (
                <motion.button
                  key="close"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setIsAiOpen(false)}
                  className="bg-surface1 text-text border-2 border-surface2 hover:border-red hover:text-red w-8 h-16 rounded-l-xl flex items-center justify-center transition-colors shadow-[-4px_0_10px_rgba(0,0,0,0.1)] focus:outline-none"
                  title="Hide AI Assistant"
                >
                  <ChevronRight size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

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
