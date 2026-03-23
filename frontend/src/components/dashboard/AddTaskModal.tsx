"use client";

import { Coins, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MIN_TASK_COINS, MAX_TASK_COINS } from "@/lib/constants";

interface AddTaskModalProps {
  isOpen: boolean;
  manualTask: string;
  manualReward: number;
  manualCategory: string;
  manualDueDate: string;
  boardColumns: string[];
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onTaskChange: (v: string) => void;
  onRewardChange: (v: number) => void;
  onCategoryChange: (v: string) => void;
  onDueDateChange: (v: string) => void;
}

/**
 * Floating action button + modal form for adding a new manual task.
 * The FAB toggles between + (open) and × (close) states.
 */
export default function AddTaskModal({
  isOpen,
  manualTask,
  manualReward,
  manualCategory,
  manualDueDate,
  boardColumns,
  onClose,
  onSubmit,
  onTaskChange,
  onRewardChange,
  onCategoryChange,
  onDueDateChange,
}: AddTaskModalProps) {
  const activeColumns = boardColumns.filter((c) => c !== "Selesai");

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.form
            initial={{ opacity: 0, scale: 0.8, y: 20, originX: 1, originY: 1 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, pointerEvents: "none" }}
            onSubmit={onSubmit}
            className="bg-surface0 border-4 border-surface1 shadow-[0_20px_50px_rgb(0,0,0,0.6)] p-6 rounded-3xl flex flex-col gap-4 w-[320px]"
          >
            {/* Modal header */}
            <div className="flex justify-between items-center border-b-2 border-surface1 pb-3">
              <h3 className="font-black text-lg text-text">Buat Task Baru</h3>
              <button
                type="button"
                onClick={onClose}
                className="text-subtext0 hover:text-red hover:rotate-90 transition-all p-1 bg-surface1 rounded-full"
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
                className="bg-base border-2 border-surface2 rounded-xl px-4 py-3 focus:border-green focus:outline-none text-sm font-bold text-text transition-colors"
              />
            </div>

            {/* Board target */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-subtext0 uppercase tracking-widest pl-1">
                Masuk Papan
              </label>
              <select
                value={manualCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-base border-2 border-surface2 rounded-xl px-4 py-3 focus:border-blue focus:outline-none text-sm font-bold text-blue cursor-pointer transition-colors appearance-none"
              >
                {activeColumns.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Due date + coin reward (side by side) */}
            <div className="flex gap-3">
              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[10px] font-black text-subtext0 uppercase tracking-widest pl-1">
                  Target Selesai
                </label>
                <input
                  type="date"
                  value={manualDueDate}
                  onChange={(e) => onDueDateChange(e.target.value)}
                  className="w-full bg-base border-2 border-surface2 rounded-xl px-3 py-3 focus:border-peach focus:outline-none text-sm text-subtext0 font-bold transition-colors cursor-pointer"
                />
              </div>

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
                    className="w-full bg-yellow/10 border-2 border-yellow/20 rounded-xl py-3 pl-9 pr-2 focus:border-yellow focus:outline-none text-sm font-black text-yellow text-right transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-green hover:bg-teal text-crust font-black py-3.5 rounded-xl mt-2 border-b-4 border-teal active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Plus size={20} strokeWidth={3} /> Tambah!
            </motion.button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.1, rotate: 180 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => (isOpen ? onClose() : onClose())} // toggled externally via isOpen prop
        aria-label={isOpen ? "Close add task form" : "Open add task form"}
        className={`w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.5)] border-4 flex items-center justify-center text-crust transition-all duration-300 z-50 ${
          isOpen ? "bg-red border-maroon rotate-45" : "bg-blue border-sapphire hover:bg-sapphire"
        }`}
      >
        <Plus size={32} strokeWidth={4} />
      </motion.button>
    </div>
  );
}
