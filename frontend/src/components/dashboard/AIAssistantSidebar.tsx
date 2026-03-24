"use client";

import { useAIAssistant } from "@/hooks/useAIAssistant";
import { Send, Coins, X, Check, MoreVertical, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DONE_COLUMN } from "@/lib/constants";

interface AIAssistantSidebarProps {
  boardColumns: string[];
  onTasksSaved: () => void;
}

export default function AIAssistantSidebar({ boardColumns, onTasksSaved }: AIAssistantSidebarProps) {
  const {
    messages,
    input,
    setInput,
    generating,
    handleSend,
    handleUpdateTask,
    handleRemoveTask,
    handleSaveTasks,
    bottomRef
  } = useAIAssistant(boardColumns, onTasksSaved);

  const activeColumns = boardColumns.filter((c) => c !== DONE_COLUMN);

  return (
    <div className="w-full h-full shrink-0 bg-surface0 border-l-4 border-surface1 flex flex-col relative z-40">
      {/* Header */}
      <div className="px-4 py-4 border-b-2 border-surface1 flex justify-between items-center bg-surface0 shrink-0">
        <h3 className="font-black text-blue flex items-center gap-2 text-lg">
          <Sparkles size={20} /> AI Assitent
        </h3>
        <button className="text-subtext0 hover:text-text">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            {/* Bubble */}
            <div
              className={`max-w-[85%] px-4 py-2 rounded-2xl border-2 font-medium text-sm shadow-sm ${
                msg.role === "user"
                  ? "bg-blue/10 border-blue text-text rounded-tr-sm"
                  : "bg-surface1 border-surface2 text-text rounded-tl-sm"
              }`}
            >
              {msg.text}
            </div>

            {/* Task list if any */}
            {msg.tasks && msg.tasks.length > 0 && (
              <div className="w-full mt-3 bg-base border-2 border-surface2 rounded-xl p-3 flex flex-col gap-3 shadow-inner">
                <AnimatePresence>
                  {msg.tasks.map((t, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="bg-surface1 p-3 rounded-lg border border-surface2 shadow-sm relative group"
                    >
                      <button
                        onClick={() => handleRemoveTask(msg.id, idx)}
                        className="absolute -top-2 -right-2 bg-red text-crust p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"
                      >
                        <X size={12} />
                      </button>

                      <input
                        type="text"
                        value={t.title}
                        onChange={(e) => handleUpdateTask(msg.id, idx, "title", e.target.value)}
                        className="text-sm font-bold bg-transparent border-b border-dashed border-surface2 focus:border-blue focus:outline-none w-full pb-1 mb-2"
                      />

                      <div className="flex flex-col gap-2">
                        <select
                          value={t.category}
                          onChange={(e) => handleUpdateTask(msg.id, idx, "category", e.target.value)}
                          className="text-xs font-bold text-blue bg-blue/10 border-0 rounded px-2 py-1 focus:outline-none cursor-pointer"
                        >
                          {activeColumns.map((c) => (
                            <option key={c} value={c} className="text-black bg-white">{c}</option>
                          ))}
                        </select>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] bg-mauve/20 text-mauve px-2 py-0.5 rounded font-black uppercase">Draft</span>
                          <div className="flex items-center gap-1 bg-surface0 px-2 py-1 rounded border border-surface2">
                            <Coins size={12} className="text-yellow" />
                            <input
                              type="number"
                              min="10"
                              max="100"
                              value={t.reward_coins}
                              onChange={(e) => handleUpdateTask(msg.id, idx, "reward_coins", parseInt(e.target.value) || 10)}
                              className="w-8 bg-transparent text-yellow font-black text-xs focus:outline-none text-right"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                <button
                  onClick={() => handleSaveTasks(msg.id)}
                  className="w-full bg-green text-crust font-black py-2 rounded-lg mt-2 flex justify-center items-center gap-2 border-b-4 border-teal active:border-b-0 active:translate-y-1 transition-all"
                >
                  <Check size={16} /> Setuju
                </button>
              </div>
            )}
          </div>
        ))}

        {generating && (
          <div className="flex justify-start">
            <div className="bg-surface1 border-2 border-surface2 px-4 py-2 rounded-2xl rounded-tl-sm text-subtext0 flex gap-1">
              <span className="animate-bounce">.</span>
              <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: "0.4s" }}>.</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-surface0 border-t-2 border-surface1 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="saya ingin ...."
            className="flex-1 bg-base border-2 border-surface2 focus:border-blue focus:outline-none rounded-xl px-4 py-2 text-sm font-medium transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || generating}
            className="bg-blue hover:bg-sapphire text-crust p-3 rounded-xl disabled:opacity-50 transition-all active:scale-95 border-b-4 border-sapphire active:border-b-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
