"use client";

import { CheckCircle, PenLine, Trash2 } from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { AnimatePresence } from "framer-motion";
import { Task } from "@/types";
import TaskCard from "./TaskCard";
import { DONE_COLUMN } from "@/lib/constants";

interface KanbanColumnProps {
  colName: string;
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onRemoveColumn: (name: string) => void;
  onClearCompleted: () => void;
}

/**
 * A single Kanban column with a droppable task list.
 * Handles the "Selesai" (done) column specifically for clear-all action.
 */
export default function KanbanColumn({
  colName,
  tasks,
  onComplete,
  onDelete,
  onRemoveColumn,
  onClearCompleted,
}: KanbanColumnProps) {
  const isDoneCol = colName === DONE_COLUMN;

  return (
    <div className="min-w-[280px] w-[280px] flex flex-col shrink-0 max-h-full">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 border-b-2 border-surface1 pb-2">
        <div className="flex items-center gap-2">
          <h3 className={`text-xl font-black flex items-center gap-2 ${isDoneCol ? "text-green" : "text-peach"}`}>
            {isDoneCol ? <CheckCircle size={20} /> : <PenLine size={20} />}
            {colName}
          </h3>
          <span className={`text-crust font-black text-xs px-2 py-0.5 rounded-full ${isDoneCol ? "bg-green" : "bg-peach"}`}>
            {tasks.length}
          </span>
        </div>

        <div className="flex gap-2 items-center">
          {!isDoneCol && colName !== "To Do" && (
            <button
              onClick={() => onRemoveColumn(colName)}
              className="text-red hover:bg-red/20 p-1 rounded-md"
              title="Delete Column"
              aria-label={`Delete column ${colName}`}
            >
              <Trash2 size={14} />
            </button>
          )}
          {isDoneCol && tasks.length > 0 && (
            <button
              onClick={onClearCompleted}
              className="text-xs font-bold text-red flex items-center gap-1 hover:bg-red/10 px-2 py-1 rounded-lg"
            >
              <Trash2 size={14} /> Clear All
            </button>
          )}
        </div>
      </div>

      {/* Droppable task list */}
      <Droppable droppableId={colName}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`border-2 rounded-2xl p-4 flex-1 overflow-y-auto space-y-3 shadow-sm custom-scrollbar transition-colors ${
              snapshot.isDraggingOver
                ? "bg-surface1/50 border-peach"
                : isDoneCol
                ? "bg-surface0/60 border-surface1"
                : "bg-surface0 border-surface1"
            }`}
            style={{ minHeight: "200px" }}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-10 text-subtext0 bg-base rounded-xl border-2 border-dashed border-surface2">
                <p className="font-bold">{isDoneCol ? "Belum ada yang selesai." : "Kosong."}</p>
              </div>
            )}

            <AnimatePresence>
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index} isDragDisabled={isDoneCol}>
                  {(provided, snapshot) => (
                    <TaskCard
                      task={task}
                      provided={provided}
                      snapshot={snapshot}
                      isDoneCol={isDoneCol}
                      onComplete={onComplete}
                      onDelete={onDelete}
                    />
                  )}
                </Draggable>
              ))}
            </AnimatePresence>

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
