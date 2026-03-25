"use client";

import { Coins, X, Plus, CalendarDays, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MIN_TASK_COINS, MAX_TASK_COINS, DONE_COLUMN } from "@/lib/constants";

interface AddTaskModalProps {
  isOpen: boolean;
  manualTask: string;
  manualReward: number;
  manualCategory: string;
  manualDueDate: string;
  manualTags: string;
  boardColumns: readonly string[] | string[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onTaskChange: (v: string) => void;
  onRewardChange: (v: number) => void;
  onCategoryChange: (v: string) => void;
  onDueDateChange: (v: string) => void;
  onTagsChange: (v: string) => void;
}

/**
 * Floating action button + modal form for adding a new manual task.
 * The FAB toggles between + (open) and × (close) states.
 */
export default function AddTaskModal({
  isOpen,
  manualTask,
  manualReward,
  manualDueDate,
  manualTags,
  manualCategory,
  boardColumns,
  onClose,
  onSubmit,
  onTaskChange,
  onRewardChange,
  onCategoryChange,
  onDueDateChange,
  onTagsChange,
}: AddTaskModalProps) {
  // Only allow Daily Quest and Event (exclude DONE_COLUMN / Selesai)
  const availableColumns = boardColumns.filter((col) => col !== DONE_COLUMN);

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.form
            initial={{ opacity: 0, scale: 0.8, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, pointerEvents: "none" }}
            onSubmit={onSubmit}
            className="bg-surface0 border-4 border-surface1 pixel-shadow-lg p-6 rounded-xl flex flex-col gap-4 w-[320px]"
          >
            {/* Modal header */}
            <div className="flex justify-between items-center border-b-2 border-surface1 pb-3">
              <h3 className="font-black text-lg text-text">Buat Task Baru</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-subtext0 hover:text-red hover:rotate-90 transition-all p-1 bg-surface1 rounded-md"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            {/* Task name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-subtext0 uppercase tracking-widest pl-1">
                Nama Tugas
              </label>
              <input
                type="text"
                required
                value={manualTask}
                onChange={(e) => onTaskChange(e.target.value)}
                placeholder="Msl: Mengerjakan jurnal..."
                className="bg-base border-2 border-surface2 rounded-lg px-4 py-3 focus:border-green focus:outline-none text-sm font-bold text-text transition-colors"
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-subtext0 uppercase tracking-widest pl-1">
                Kategori
              </label>
              <select
                value={manualCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-base border-2 border-surface2 rounded-lg px-4 py-3 focus:border-blue focus:outline-none text-sm font-bold text-blue cursor-pointer transition-colors appearance-none"
              >
                {availableColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-subtext0 uppercase tracking-widest pl-1">
                Tags (pisahkan dengan koma)
              </label>
              <div className="relative w-full">
                <Tag className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtext0" size={16} />
                <input
                  type="text"
                  value={manualTags}
                  onChange={(e) => onTagsChange(e.target.value)}
                  placeholder="Msl: Belajar, Penting"
                  className="w-full bg-base border-2 border-surface2 rounded-lg py-3 pl-9 pr-2 focus:border-mauve focus:outline-none text-sm font-bold text-text transition-colors"
                />
              </div>
            </div>

            {/* Due date + coin reward (side by side) */}
            <div className="flex gap-3">
              {manualCategory !== "Daily Quest" ? (
                <div className="flex flex-col gap-1.5 flex-1">
                  <label className="text-[10px] font-black text-subtext0 uppercase tracking-widest pl-1">
                    Target Selesai
                  </label>
                  <div className="relative w-full">
                    <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtext0" size={16} />
                    <input
                      type="date"
                      value={manualDueDate}
                      onChange={(e) => onDueDateChange(e.target.value)}
                      className="w-full bg-base border-2 border-surface2 rounded-lg pl-9 pr-3 py-3 focus:border-peach focus:outline-none text-sm text-subtext0 font-bold transition-colors cursor-pointer"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1" />
              )}

              <div className="flex flex-col gap-1.5 w-24 shrink-0">
                <label className="text-[10px] font-black text-yellow uppercase tracking-widest pl-1">
                  Target Koin
                </label>
                <div className="relative w-full">
                  <Coins className="absolute left-2.5 top-1/2 -translate-y-1/2 text-yellow" size={16} />
                  <input
                    type="number"
                    min={MIN_TASK_COINS}
                    max={MAX_TASK_COINS}
                    value={manualReward}
                    onChange={(e) => onRewardChange(parseInt(e.target.value) || MIN_TASK_COINS)}
                    className="w-full bg-yellow/10 border-2 border-yellow/20 rounded-lg py-3 pl-9 pr-2 focus:border-yellow focus:outline-none text-sm font-black text-yellow text-right transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-green hover:bg-teal text-crust font-black py-3.5 rounded-lg mt-2 border-2 border-teal border-b-4 active:translate-y-[1px] active:border-b-2 flex items-center justify-center gap-2 transition-all uppercase tracking-wider"
            >
              <Plus size={20} strokeWidth={3} /> Tambah!
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

    </div>
  );
}
