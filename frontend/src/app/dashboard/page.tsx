"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { Filter, Plus, Trash2 } from "lucide-react";

import { useDashboard } from "@/hooks/useDashboard";
import LoadingScreen from "@/components/ui/LoadingScreen";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import AIQuestPanel from "@/components/dashboard/AIQuestPanel";
import KanbanColumn from "@/components/dashboard/KanbanColumn";
import AddTaskModal from "@/components/dashboard/AddTaskModal";
import PetSidebar from "@/components/dashboard/PetSidebar";
import { DONE_COLUMN } from "@/lib/constants";

const boardVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

export default function DashboardPage() {
  const router = useRouter();
  const [newColumnName, setNewColumnName] = useState("");

  const {
    mounted, data, tasks, boardColumns, visibleColumns,
    goal, generating, aiTasks,
    isAddingTask, manualTask, manualReward, manualCategory, manualDueDate,
    isFeeding,
    setGoal, setIsAddingTask,
    setManualTask, setManualReward, setManualCategory, setManualDueDate,
    handleLogout, completeTask, deleteTask, clearCompleted, feedPet, discardPet,
    addManualTask, addColumn, removeColumn, onDragEnd,
    handleGenerateAI, saveAITasks, updateAiTask, removeAiTask,
    toggleColumnVis, clearColumnFilter,
  } = useDashboard();

  if (!mounted || !data) return <LoadingScreen />;

  const visibleCols = boardColumns.filter(
    (c) => visibleColumns.length === 0 || visibleColumns.includes(c)
  );

  const handleAddColumn = () => {
    addColumn(newColumnName);
    setNewColumnName("");
  };

  return (
    <div className="h-screen bg-base flex flex-col overflow-hidden">
      {/* Header */}
      <DashboardHeader
        data={data}
        onLogout={handleLogout}
      />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Kanban Board & Filters */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Column Filter Bar */}
          <div className="bg-surface0 border-b-2 border-surface1 px-6 py-3 flex items-center gap-4 overflow-x-auto custom-scrollbar z-10 shrink-0 shadow-sm">
            <span className="text-sm font-black text-subtext0 flex items-center gap-2 shrink-0">
              <Filter size={16} /> Filter Papan:
            </span>
            <button
              onClick={clearColumnFilter}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-all shrink-0 ${
                visibleColumns.length === 0
                  ? "bg-blue text-crust shadow-md"
                  : "bg-surface1 text-text border-2 border-surface2 hover:border-blue/50"
              }`}
            >
              Semua Papan
            </button>
            {boardColumns.map((col) => (
              <button
                key={col}
                onClick={() => toggleColumnVis(col)}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-all shrink-0 border-2 ${
                  visibleColumns.includes(col)
                    ? "bg-peach border-peach text-crust shadow-md"
                    : "bg-surface1 border-surface2 text-text hover:border-peach/50"
                }`}
              >
                {col}
              </button>
            ))}
          </div>

          {/* Kanban Board */}
          <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
            <motion.div
              variants={boardVariants}
              initial="hidden"
              animate="show"
              className="flex gap-6 h-full min-w-max pb-4 items-start"
            >
              {/* AI Quest Panel */}
              <AIQuestPanel
                goal={goal}
                generating={generating}
                aiTasks={aiTasks}
                boardColumns={boardColumns}
                onGoalChange={setGoal}
                onGenerate={handleGenerateAI}
                onSaveAll={saveAITasks}
                onUpdateTask={updateAiTask}
                onRemoveTask={removeAiTask}
              />

              {/* Kanban Columns */}
              <DragDropContext onDragEnd={onDragEnd}>
                {visibleCols.map((colName) => {
                  const colTasks = tasks
                    .filter((t) =>
                      colName === DONE_COLUMN
                        ? t.is_completed
                        : !t.is_completed && t.category === colName
                    )
                    .sort((a, b) => a.order_index - b.order_index);

                  return (
                    <KanbanColumn
                      key={colName}
                      colName={colName}
                      tasks={colTasks}
                      onComplete={completeTask}
                      onDelete={deleteTask}
                      onRemoveColumn={removeColumn}
                      onClearCompleted={clearCompleted}
                    />
                  );
                })}
              </DragDropContext>

              {/* Add Column Widget */}
              <div className="w-[300px] flex flex-col shrink-0 mt-[44px]">
                <div className="bg-surface0 border-2 border-dashed border-surface2 hover:border-peach transition-colors rounded-2xl p-4 flex flex-col gap-3 group">
                  <h4 className="font-black text-subtext0 group-hover:text-peach flex items-center gap-2">
                    <Plus size={18} /> Tambah Kolom
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAddColumn()}
                      placeholder="Msl. Daily Quest"
                      className="bg-base border-2 border-surface1 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:border-peach"
                    />
                    <button
                      onClick={handleAddColumn}
                      className="bg-peach hover:bg-rosewater text-crust p-2 rounded-xl font-black"
                      aria-label="Add column"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Trash Can Drop Zone for Pet Deletion */}
          <div 
            id="trash-can"
            className="absolute bottom-6 right-[340px] w-20 h-20 bg-red/10 border-4 border-dashed border-red/50 text-red rounded-3xl flex items-center justify-center transition-all shadow-lg z-0 opacity-40 hover:opacity-100 hover:scale-110 hover:bg-red/20"
            title="Tarik Peliharaan Kesini Untuk Dibuang"
          >
            <Trash2 size={32} />
          </div>
        </div>

        {/* Right Side: Pet Sidebar */}
        <PetSidebar 
          data={data} 
          onClickShop={() => router.push("/shop")} 
          onFeedPet={feedPet}
          isFeeding={isFeeding}
          onDeletePet={discardPet}
        />
      </div>

      {/* Add Task FAB + Modal */}
      <AddTaskModal
        isOpen={isAddingTask}
        manualTask={manualTask}
        manualReward={manualReward}
        manualCategory={manualCategory}
        manualDueDate={manualDueDate}
        boardColumns={boardColumns}
        onClose={() => setIsAddingTask(!isAddingTask)}
        onSubmit={addManualTask}
        onTaskChange={setManualTask}
        onRewardChange={setManualReward}
        onCategoryChange={setManualCategory}
        onDueDateChange={setManualDueDate}
      />
    </div>
  );
}
