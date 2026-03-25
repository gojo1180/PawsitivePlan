"use client";
/* eslint-disable react-hooks/refs */
import { Coins, Trash2, CheckCircle, CalendarDays, GripVertical } from "lucide-react";
import { DraggableProvided, DraggableStateSnapshot } from "@hello-pangea/dnd";
import { format } from "date-fns";
import { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  provided: DraggableProvided;
  snapshot: DraggableStateSnapshot;
  isDoneCol: boolean;
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

/**
 * Individual draggable task card for the Kanban board.
 * Shows task title, optional due date, AI badge, coin reward,
 * and action buttons (complete / delete) on hover.
 */
export default function TaskCard({
  task,
  provided,
  snapshot,
  isDoneCol,
  onComplete,
  onDelete,
}: TaskCardProps) {
  /** Play confirmation sound instantly on click, then delegate to parent handler. */
  const handleComplete = (id: string) => {
    try {
      const audio = new Audio("/asset/audio/confirmation_task.mp3");
      audio.play();
    } catch (e) {
      console.error("Audio play failed:", e);
    }
    onComplete(id);
  };

  /** Play cancel sound instantly on click, then delegate to parent handler. */
  const handleDelete = (id: string) => {
    try {
      const audio = new Audio("/asset/audio/Cancel_task.mp3");
      audio.play();
    } catch (e) {
      console.error("Audio play failed:", e);
    }
    onDelete(id);
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`flex flex-col bg-surface1 p-4 rounded-xl border-2 hover:border-peach transition-colors group shadow-sm gap-3 ${
        snapshot.isDragging
          ? "border-peach shadow-xl ring-2 ring-peach/50"
          : "border-surface2"
      }`}
      style={{ ...provided.draggableProps.style, opacity: isDoneCol ? 0.7 : 1 }}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex gap-2 items-start">
          {/* Drag handle */}
          <div {...provided.dragHandleProps} className={`mt-1 transition-colors ${isDoneCol ? 'text-surface2 cursor-not-allowed opacity-50' : 'text-overlay1 hover:text-mauve cursor-grab'}`}>
            <GripVertical size={16} />
          </div>

          <div className="flex flex-col">
            <h4 className={`font-bold text-sm text-text leading-tight ${isDoneCol ? "line-through text-subtext0" : ""}`}>
              {task.title}
            </h4>
            <div className="flex flex-col gap-1 mt-1">
              {task.due_date && (
                <div className="flex items-center gap-1 text-[10px] text-maroon font-black uppercase">
                  <CalendarDays size={12} />
                  {format(new Date(task.due_date), "dd MMM")}
                </div>
              )}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {task.tags.map((tag, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-surface2 text-text rounded text-[9px] font-bold tracking-wide uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hover action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleDelete(task.id)}
            className="text-overlay0 hover:text-red transition-colors"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
          {!isDoneCol && (
            <button
              onClick={() => handleComplete(task.id)}
              className="text-overlay0 hover:text-green transition-colors"
              aria-label="Mark task complete"
            >
              <CheckCircle size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Footer: badge + coins */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface2">
        {task.is_ai_generated ? (
          <span className="text-[10px] uppercase font-black bg-blue/10 text-blue px-2 py-0.5 rounded border border-blue/20">
            AI Generated
          </span>
        ) : (
          <span />
        )}
        <span className="text-yellow font-black flex items-center gap-1 text-xs">
          <Coins size={14} /> {task.reward_coins}
        </span>
      </div>
    </div>
  );
}
