"use client";

import { Coins, X, RefreshCw, Sparkles, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AiTaskDraft } from "@/types";

interface AIQuestPanelProps {
  goal: string;
  generating: boolean;
  aiTasks: AiTaskDraft[];
  boardColumns: string[];
  onGoalChange: (value: string) => void;
  onGenerate: () => void;
  onSaveAll: () => void;
  onUpdateTask: (index: number, field: string, value: string | number) => void;
  onRemoveTask: (index: number) => void;
}

/**
 * Left-side panel on the kanban board for AI quest generation.
 * Users input a goal, Gemini generates task drafts, user edits and saves them.
 */
export default function AIQuestPanel({
  goal,
  generating,
  aiTasks,
  boardColumns,
  onGoalChange,
  onGenerate,
  onSaveAll,
  onUpdateTask,
  onRemoveTask,
}: AIQuestPanelProps) {
  const activeColumns = boardColumns.filter((c) => c !== "Selesai");

  return (
    <div className="w-[280px] flex flex-col shrink-0 max-h-full">
      <div className="flex items-center justify-between mb-3 border-b-2 border-surface1 pb-2">
        <h3 className="text-xl font-black text-blue flex items-center gap-2">
          <Sparkles size={20} /> AI Quests
        </h3>
        <span className="bg-blue text-crust font-black text-xs px-2 py-0.5 rounded-full">
          {aiTasks.length > 0 ? aiTasks.length : "?"}
        </span>
      </div>

      <div className="bg-surface0 border-2 border-surface1 rounded-2xl p-4 flex-1 overflow-y-auto space-y-4 shadow-sm custom-scrollbar">
        <p className="text-sm font-medium text-subtext0 mb-2">Break down major goals into tasks:</p>

        <textarea
          value={goal}
          onChange={(e) => onGoalChange(e.target.value)}
          placeholder="e.g., I want to read 12 books this year"
          className="w-full bg-base border-2 border-surface2 rounded-xl px-3 py-3 focus:outline-none focus:border-blue placeholder:text-surface2 font-medium text-sm resize-none h-24"
        />

        <motion.button
          onClick={onGenerate}
          disabled={generating || !goal}
          className="w-full bg-blue text-crust font-black py-2.5 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 border-b-4 border-sapphire active:border-b-0 active:translate-y-1"
          whileTap={{ scale: 0.98 }}
        >
          {generating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
          Generate Quests
        </motion.button>

        <AnimatePresence>
          {aiTasks.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface1 p-3 rounded-xl border-2 border-surface2 shadow-sm flex flex-col gap-2 group relative"
            >
              <button
                onClick={() => onRemoveTask(idx)}
                className="absolute -top-2 -right-2 bg-red text-base p-1 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 shadow-md"
                aria-label="Remove task"
              >
                <X size={14} />
              </button>

              <input
                type="text"
                value={t.title}
                onChange={(e) => onUpdateTask(idx, "title", e.target.value)}
                className="text-sm font-bold text-text bg-transparent border-b border-dashed border-surface2 focus:border-blue focus:outline-none w-full pb-1"
              />

              <select
                value={t.category}
                onChange={(e) => onUpdateTask(idx, "category", e.target.value)}
                className="text-xs font-bold text-blue bg-blue/10 border-0 rounded px-2 py-1 mt-1 focus:outline-none w-full cursor-pointer appearance-none"
              >
                {activeColumns.map((c) => (
                  <option key={c} value={c} className="text-black bg-white">
                    {c}
                  </option>
                ))}
              </select>

              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] bg-blue/20 text-blue px-2 py-0.5 rounded uppercase font-black">
                  AI
                </span>
                <div className="flex items-center gap-1 bg-surface0 px-2 py-1 rounded-lg border border-surface2">
                  <Coins size={14} className="text-yellow" />
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={t.reward_coins}
                    onChange={(e) => onUpdateTask(idx, "reward_coins", parseInt(e.target.value) || 10)}
                    className="w-10 bg-transparent text-yellow font-black text-xs focus:outline-none text-right"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {aiTasks.length > 0 && (
          <motion.button
            onClick={onSaveAll}
            className="w-full bg-green text-crust font-black py-2.5 rounded-xl border-b-4 border-teal flex justify-center items-center gap-2 mt-2 shadow-sm active:translate-y-1 active:border-b-0"
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} /> Add All To Dashboard
          </motion.button>
        )}
      </div>
    </div>
  );
}
