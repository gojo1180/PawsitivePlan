"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Coins, LogOut, CheckCircle, Sparkles, Plus, RefreshCw, PenLine, Target, ShoppingBag, Trash2, X, CalendarDays, GripVertical, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { format } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  
  // Board Customization & Filtering
  const [boardColumns, setBoardColumns] = useState<string[]>([]);
  const [newColumnName, setNewColumnName] = useState("");
  const [visibleColumns, setVisibleColumns] = useState<string[]>([]);

  // Tasks State
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiTasks, setAiTasks] = useState<any[]>([]);

  const [manualTask, setManualTask] = useState("");
  const [manualReward, setManualReward] = useState(10);
  const [manualCategory, setManualCategory] = useState("To Do");
  const [manualDueDate, setManualDueDate] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);

  const loadDashboard = async () => {
    try {
      const [petData, tasksData, shopData] = await Promise.all([
        fetchApi("/pets/me"),
        fetchApi("/tasks"),
        fetchApi("/shop"),
      ]);
      setData(petData);
      setTasks(tasksData);
      setShopItems(shopData);
      setBoardColumns(petData.profile?.board_columns || ["To Do", "Daily Quest", "Event", "Selesai"]);
    } catch (err) {
      router.push("/login");
    }
  };

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("access_token");
    if (!token) return router.push("/login");
    const savedVis = localStorage.getItem("visible_columns");
    if (savedVis) setVisibleColumns(JSON.parse(savedVis));
    loadDashboard();
  }, [router]);

  const toggleColumnVis = (colName: string) => {
    let newVis;
    if (visibleColumns.includes(colName)) {
      newVis = visibleColumns.filter(c => c !== colName);
    } else {
      newVis = [...visibleColumns, colName];
    }
    setVisibleColumns(newVis);
    localStorage.setItem("visible_columns", JSON.stringify(newVis));
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const completeTask = async (taskId: string) => {
    try {
      const res = await fetchApi(`/tasks/${taskId}/complete`, { method: "PATCH" });
      setData({ ...data, profile: { ...data.profile, coins: res.new_coins_balance }});
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, is_completed: true, category: "Selesai" } : t));
    } catch (err) {
      alert("Failed to complete task");
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetchApi(`/tasks/${taskId}`, { method: "DELETE" });
      setTasks(prev => prev.filter(t => t.id !== taskId));
    } catch (err) {
      alert("Failed to delete task");
    }
  };

  const clearCompleted = async () => {
    try {
      await fetchApi("/tasks/clear/completed", { method: "DELETE" });
      setTasks(prev => prev.filter(t => !t.is_completed));
    } catch (err) {
      alert("Failed to clear tasks");
    }
  };

  const addManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTask) return;
    try {
      const activeColumns = boardColumns.filter(c => c !== "Selesai");
      // Fallback category to first available if "To Do" was deleted but state wasn't updated
      const safeCategory = activeColumns.includes(manualCategory) ? manualCategory : (activeColumns[0] || "To Do");
      
      const isoDate = manualDueDate ? new Date(manualDueDate).toISOString() : null;
      await fetchApi("/tasks", {
        method: "POST",
        body: JSON.stringify({ 
          title: manualTask, 
          reward_coins: manualReward, 
          is_ai_generated: false,
          category: safeCategory,
          due_date: isoDate
        })
      });
      setManualTask("");
      setManualReward(10);
      setManualDueDate("");
      setIsAddingTask(false);
      loadDashboard();
    } catch (err: any) {
      alert(`Gagal menambah task: ${err.message || "Validasi gagal. Pastikan target koin maksimal 30."}`);
    }
  };

  const addColumn = async () => {
    if (!newColumnName.trim()) return;
    const coreCols = boardColumns.filter(c => c !== "Selesai");
    const newCols = [...coreCols, newColumnName.trim(), "Selesai"];
    setBoardColumns(newCols);
    setNewColumnName("");
    try {
      await fetchApi("/tasks/board/columns", {
        method: "PATCH",
        body: JSON.stringify({ columns: newCols })
      });
    } catch (err) {}
  };

  const removeColumn = async (colName: string) => {
    const newCols = boardColumns.filter(c => c !== colName);
    setBoardColumns(newCols);
    try {
      await fetchApi("/tasks/board/columns", {
        method: "PATCH",
        body: JSON.stringify({ columns: newCols })
      });
    } catch (err) {}
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI Update
    const draggedTask = tasks.find(t => t.id === draggableId);
    if (!draggedTask) return;

    const newCategory = destination.droppableId;
    
    // Complete logic if dropped in "Selesai"
    if (newCategory === "Selesai" && !draggedTask.is_completed) {
       completeTask(draggableId);
       return; // completeTask handles state and backend
    }
    
    // Revert complete logic if moved out of "Selesai"
    let updatedCompletedStatus = draggedTask.is_completed;
    if (source.droppableId === "Selesai" && newCategory !== "Selesai") {
       updatedCompletedStatus = false;
       // We technically don't refund coins in this simple app version, we just mark incomplete
    }

    setTasks(prev => prev.map(t => {
       if (t.id === draggableId) return { ...t, category: newCategory, order_index: destination.index, is_completed: updatedCompletedStatus };
       return t;
    }));

    try {
      await fetchApi(`/tasks/${draggableId}`, {
        method: "PATCH",
        body: JSON.stringify({ category: newCategory, order_index: destination.index, is_completed: updatedCompletedStatus })
      });
    } catch {
       loadDashboard(); // rollback on error
    }
  };

  const handleGenerateAI = async () => {
    if (!goal) return;
    setGenerating(true);
    try {
      const gTasks = await fetchApi("/api/generate-tasks", {
        method: "POST",
        body: JSON.stringify({ goal })
      });
      // Berikan nilai default category ke kolom pertama yang aktif agar tidak membanjiri "To Do" fiktif
      const defaultCategory = boardColumns.find(c => c !== "Selesai") || "To Do";
      setAiTasks(gTasks.map((t: any) => ({ ...t, category: defaultCategory })));
    } catch (err) {
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
          body: JSON.stringify({ title: t.title, reward_coins: t.reward_coins, is_ai_generated: true, category: t.category })
        });
      }
      setAiTasks([]);
      setGoal("");
      loadDashboard();
    } catch (err) {
      alert("Failed to save tasks.");
    }
  };

  const updateAiTask = (index: number, field: string, value: any) => {
    const newTasks = [...aiTasks];
    newTasks[index] = { ...newTasks[index], [field]: value };
    setAiTasks(newTasks);
  };
  
  const removeAiTask = (index: number) => {
    const newTasks = [...aiTasks];
    newTasks.splice(index, 1);
    setAiTasks(newTasks);
  };

  if (!mounted || !data) return (
    <div className="min-h-screen flex items-center justify-center bg-base text-mauve">
      <RefreshCw className="animate-spin" size={48} />
    </div>
  );

  const { pet, profile, equipped_items } = data;

  return (
    <div className="min-h-screen bg-base flex flex-col">
      {/* Top Header */}
      <header className="bg-surface0 border-b-4 border-surface1 shadow-sm px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 bg-gradient-to-br from-surface1 to-surface0 rounded-2xl border-4 border-surface2 overflow-hidden flex items-center justify-center shadow-inner shrink-0 group hover:scale-105 transition-transform cursor-pointer" onClick={() => router.push("/shop")}>
            <div className="absolute inset-0 flex items-center justify-center opacity-10 blur-sm z-0">
              <p className="text-4xl">{pet.species === "kucing" ? "🐱" : pet.species === "anjing" ? "🐶" : "🐦"}</p>
            </div>
            <img 
              src={`/pets/${pet.species}_${pet.level < 6 ? 'bayi' : 'dewasa'}.png`} 
              alt={pet.name}
              className="absolute inset-0 w-full h-full object-contain z-10 drop-shadow-sm"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            {equipped_items?.map((item: any) => (
              <img 
                key={item.id}
                src={item.image_url} 
                alt={item.name}
                className="absolute inset-0 w-full h-full object-contain z-20 drop-shadow-sm"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <h2 className="font-black text-xl text-mauve tracking-wide flex items-center gap-2">
              {profile.username}
              <span className="text-[10px] bg-mauve/20 text-mauve px-2 py-1 rounded-md uppercase tracking-widest leading-none">Lv. {pet.level} {pet.species}</span>
            </h2>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-2 bg-surface1 px-3 py-1.5 rounded-xl border-2 border-surface2">
                <Coins size={16} className="text-yellow" /> 
                <span className="font-black text-yellow text-sm leading-none">{profile.coins}</span>
              </div>
              <div className="flex items-center gap-2 bg-surface1 px-3 py-1.5 rounded-xl border-2 border-surface2 min-w-[120px]">
                <Sparkles size={16} className="text-blue shrink-0" />
                <div className="w-full bg-surface2 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-blue h-full rounded-full transition-all duration-1000" style={{ width: `${(pet.experience % 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button onClick={handleLogout} className="bg-red/10 text-red border-2 border-red/20 hover:bg-red hover:text-crust transition-colors px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
            <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="bg-surface0 border-b-2 border-surface1 px-6 py-3 flex items-center gap-4 overflow-x-auto custom-scrollbar z-10 shrink-0 shadow-sm">
        <span className="text-sm font-black text-subtext0 flex items-center gap-2 shrink-0"><Filter size={16}/> Filter Papan:</span>
        <button 
          onClick={() => { setVisibleColumns([]); localStorage.removeItem("visible_columns"); }}
          className={`px-4 py-1.5 rounded-full text-xs font-black transition-all shrink-0 ${visibleColumns.length === 0 ? 'bg-blue text-crust shadow-md' : 'bg-surface1 text-text border-2 border-surface2 hover:border-blue/50'}`}
        >
          Semua Papan
        </button>
        {boardColumns.map(col => (
          <button 
            key={col}
            onClick={() => toggleColumnVis(col)}
            className={`px-4 py-1.5 rounded-full text-xs font-black transition-all shrink-0 border-2 ${visibleColumns.includes(col) ? 'bg-peach border-peach text-crust shadow-md' : 'bg-surface1 border-surface2 text-text hover:border-peach/50'}`}
          >
            {col}
          </button>
        ))}
      </div>

      {/* Main Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex gap-6 h-full min-w-max pb-4 items-start">
          
          {/* AI Quests Column */}
          <div className="w-[340px] flex flex-col shrink-0 max-h-full">
            <div className="flex items-center justify-between mb-3 border-b-2 border-surface1 pb-2">
              <h3 className="text-xl font-black text-blue flex items-center gap-2">
                <Target size={20} /> AI Quests
              </h3>
              <span className="bg-blue text-crust font-black text-xs px-2 py-0.5 rounded-full">{aiTasks.length > 0 ? aiTasks.length : '?'}</span>
            </div>
            
            <div className="bg-surface0 border-2 border-surface1 rounded-2xl p-4 flex-1 overflow-y-auto space-y-4 shadow-sm custom-scrollbar">
              <p className="text-sm font-medium text-subtext0 mb-2">Break down major goals into tasks:</p>
              <textarea value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="e.g., I want to read 12 books this year" className="w-full bg-base border-2 border-surface2 rounded-xl px-3 py-3 focus:outline-none focus:border-blue placeholder:text-surface2 font-medium text-sm resize-none h-24" />
              <motion.button onClick={handleGenerateAI} disabled={generating || !goal} className="w-full bg-blue text-crust font-black py-2.5 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 border-b-4 border-sapphire active:border-b-0 active:translate-y-1">
                {generating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />} Generate Quests
              </motion.button>

              <AnimatePresence>
                {aiTasks.map((t, idx) => (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} key={idx} className="bg-surface1 p-3 rounded-xl border-2 border-surface2 shadow-sm flex flex-col gap-2 group relative">
                    <button onClick={() => removeAiTask(idx)} className="absolute -top-2 -right-2 bg-red text-base p-1 rounded-full opacity-0 group-hover:opacity-100 hover:scale-110 shadow-md">
                      <X size={14} />
                    </button>
                    <input type="text" value={t.title} onChange={(e) => updateAiTask(idx, "title", e.target.value)} className="text-sm font-bold text-text bg-transparent border-b border-dashed border-surface2 focus:border-blue focus:outline-none w-full pb-1" />
                    
                    <select 
                       value={t.category} 
                       onChange={(e) => updateAiTask(idx, "category", e.target.value)}
                       className="text-xs font-bold text-blue bg-blue/10 border-0 rounded px-2 py-1 mt-1 focus:outline-none w-full cursor-pointer appearance-none"
                    >
                      {boardColumns.filter(c => c !== "Selesai").map(c => <option key={c} value={c} className="text-black bg-white">{c}</option>)}
                    </select>

                    <div className="flex justify-between items-center mt-1">
                       <span className="text-[10px] bg-blue/20 text-blue px-2 py-0.5 rounded uppercase font-black">AI</span>
                       <div className="flex items-center gap-1 bg-surface0 px-2 py-1 rounded-lg border border-surface2">
                         <Coins size={14} className="text-yellow" />
                         <input type="number" min="10" max="100" value={t.reward_coins} onChange={(e) => updateAiTask(idx, "reward_coins", parseInt(e.target.value) || 10)} className="w-10 bg-transparent text-yellow font-black text-xs focus:outline-none text-right" />
                       </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {aiTasks.length > 0 && (
                <motion.button onClick={saveAITasks} className="w-full bg-green text-crust font-black py-2.5 rounded-xl border-b-4 border-teal flex justify-center items-center gap-2 mt-2 shadow-sm active:translate-y-1 active:border-b-0">
                  <Plus size={18} /> Add All To Dashboard
                </motion.button>
              )}
            </div>
          </div>

          {/* DND Custom Kanban Columns */}
          <DragDropContext onDragEnd={onDragEnd}>
            {boardColumns.filter(c => visibleColumns.length === 0 || visibleColumns.includes(c)).map((colName) => {
              const colTasks = tasks.filter(t => (
                 colName === "Selesai" ? t.is_completed : (!t.is_completed && t.category === colName)
              )).sort((a,b) => a.order_index - b.order_index);

              const isDoneCol = colName === "Selesai";

              return (
                <div key={colName} className="w-[340px] flex flex-col shrink-0 max-h-full">
                  <div className="flex items-center justify-between mb-3 border-b-2 border-surface1 pb-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-xl font-black flex items-center gap-2 ${isDoneCol ? "text-green" : "text-peach"}`}>
                        {isDoneCol ? <CheckCircle size={20} /> : <PenLine size={20} />} {colName}
                      </h3>
                      <span className={`text-crust font-black text-xs px-2 py-0.5 rounded-full ${isDoneCol ? 'bg-green' : 'bg-peach'}`}>{colTasks.length}</span>
                    </div>
                    
                    <div className="flex gap-2 items-center">
                      {!isDoneCol && colName !== "To Do" && (
                        <button onClick={() => removeColumn(colName)} className="text-red hover:bg-red/20 p-1 rounded-md" title="Delete Column">
                          <Trash2 size={14} />
                        </button>
                      )}
                      {isDoneCol && colTasks.length > 0 && (
                        <button onClick={clearCompleted} className="text-xs font-bold text-red flex items-center gap-1 hover:bg-red/10 px-2 py-1 rounded-lg">
                          <Trash2 size={14} /> Clear All
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <Droppable droppableId={colName}>
                    {(provided: any, snapshot: any) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        className={`border-2 rounded-2xl p-4 flex-1 overflow-y-auto space-y-3 shadow-sm custom-scrollbar transition-colors ${
                          snapshot.isDraggingOver ? 'bg-surface1/50 border-peach' : (isDoneCol ? 'bg-surface0/60 border-surface1' : 'bg-surface0 border-surface1')
                        }`}
                        style={{ minHeight: "200px" }}
                      >
                        {colTasks.length === 0 && !snapshot.isDraggingOver && (
                          <div className="text-center py-10 text-subtext0 bg-base rounded-xl border-2 border-dashed border-surface2">
                            <p className="font-bold">{isDoneCol ? "Belum ada yang selesai." : "Kosong."}</p>
                          </div>
                        )}

                        <AnimatePresence>
                          {colTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided: any, snapshot: any) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`flex flex-col bg-surface1 p-4 rounded-xl border-2 hover:border-peach transition-colors group shadow-sm gap-3 ${
                                    snapshot.isDragging ? 'border-peach shadow-xl ring-2 ring-peach/50' : 'border-surface2'
                                  }`}
                                  style={{ ...provided.draggableProps.style, opacity: isDoneCol ? 0.7 : 1 }}
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <div className="flex gap-2 items-start">
                                      <div {...provided.dragHandleProps} className="mt-1 text-surface2 hover:text-text cursor-grab">
                                        <GripVertical size={16} />
                                      </div>
                                      <div className="flex flex-col">
                                        <h4 className={`font-bold text-sm text-text leading-tight ${isDoneCol ? 'line-through text-subtext0' : ''}`}>{task.title}</h4>
                                        {task.due_date && (
                                          <div className="flex items-center gap-1 text-[10px] text-maroon font-black mt-1 uppercase">
                                            <CalendarDays size={12} /> {format(new Date(task.due_date), "dd MMM")}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                      <button onClick={() => deleteTask(task.id)} className="text-surface2 hover:text-red">
                                        <Trash2 size={16} />
                                      </button>
                                      {!isDoneCol && (
                                        <button onClick={() => completeTask(task.id)} className="text-surface2 hover:text-green">
                                          <CheckCircle size={20} />
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface2">
                                    {task.is_ai_generated ? (
                                      <span className="text-[10px] uppercase font-black bg-blue/10 text-blue px-2 py-0.5 rounded border border-blue/20">AI Generated</span>
                                    ) : <span />}
                                    <span className="text-yellow font-black flex items-center gap-1 text-xs">
                                      <Coins size={14} /> {task.reward_coins}
                                    </span>
                                  </div>
                                </div>
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
            })}
          </DragDropContext>

          {/* Add Board Column Button */}
          <div className="w-[300px] flex flex-col shrink-0 mt-[44px]">
             <div className="bg-surface0 border-2 border-dashed border-surface2 hover:border-peach transition-colors rounded-2xl p-4 flex flex-col gap-3 group">
               <h4 className="font-black text-subtext0 group-hover:text-peach flex items-center gap-2"><Plus size={18}/> Tambah Kolom</h4>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={newColumnName} 
                   onChange={(e) => setNewColumnName(e.target.value)} 
                   placeholder="Msl. Daily Quest" 
                   className="bg-base border-2 border-surface1 rounded-xl px-3 py-2 text-sm w-full focus:outline-none focus:border-peach"
                 />
                 <button onClick={addColumn} className="bg-peach hover:bg-rosewater text-crust p-2 rounded-xl font-black">
                   <Plus size={18} />
                 </button>
               </div>
             </div>
          </div>

        </motion.div>
      </div>

      {/* Floating Action Button & Add Task Form Modal */}
      <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
        <AnimatePresence>
          {isAddingTask && (
            <motion.form 
              initial={{ opacity: 0, scale: 0.8, y: 20, originX: 1, originY: 1 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20, pointerEvents: 'none' }}
              onSubmit={addManualTask}
              className="bg-surface0 border-4 border-surface1 shadow-[0_20px_50px_rgb(0,0,0,0.6)] p-6 rounded-3xl flex flex-col gap-4 w-[320px]"
            >
               <div className="flex justify-between items-center border-b-2 border-surface1 pb-3">
                 <h3 className="font-black text-lg text-text">Buat Task Baru</h3>
                 <button type="button" onClick={() => setIsAddingTask(false)} className="text-subtext0 hover:text-red hover:rotate-90 transition-all p-1 bg-surface1 rounded-full"><X size={18}/></button>
               </div>
               
               <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-black text-subtext0 uppercase tracking-widest pl-1">Nama Tugas</label>
                 <input type="text" required value={manualTask} onChange={(e) => setManualTask(e.target.value)} placeholder="Msl: Mengerjakan jurnal..." className="bg-base border-2 border-surface2 rounded-xl px-4 py-3 focus:border-green focus:outline-none text-sm font-bold text-text transition-colors" />
               </div>

               <div className="flex flex-col gap-1.5">
                 <label className="text-[10px] font-black text-subtext0 uppercase tracking-widest pl-1">Masuk Papan</label>
                 <div className="relative">
                   <select value={manualCategory} onChange={(e) => setManualCategory(e.target.value)} className="w-full bg-base border-2 border-surface2 rounded-xl px-4 py-3 focus:border-blue focus:outline-none text-sm font-bold text-blue cursor-pointer transition-colors appearance-none">
                     {boardColumns.filter(c => c !== "Selesai").map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
               </div>
               
               <div className="flex gap-3">
                 <div className="flex flex-col gap-1.5 flex-1">
                   <label className="text-[10px] font-black text-subtext0 uppercase tracking-widest pl-1">Target Selesai</label>
                   <input type="date" value={manualDueDate} onChange={(e) => setManualDueDate(e.target.value)} className="w-full bg-base border-2 border-surface2 rounded-xl px-3 py-3 focus:border-peach focus:outline-none text-sm text-subtext0 font-bold transition-colors cursor-pointer" />
                 </div>
                 
                 <div className="flex flex-col gap-1.5 w-24 shrink-0">
                   <label className="text-[10px] font-black text-yellow uppercase tracking-widest pl-1">Target Koin</label>
                   <div className="relative w-full">
                     <Coins className="absolute left-2.5 top-1/2 -translate-y-1/2 text-yellow" size={16}/>
                     <input type="number" min="10" max="30" value={manualReward} onChange={(e) => setManualReward(parseInt(e.target.value)||10)} className="w-full bg-yellow/10 border-2 border-yellow/20 rounded-xl py-3 pl-9 pr-2 focus:border-yellow focus:outline-none text-sm font-black text-yellow text-right transition-colors" />
                   </div>
                 </div>
               </div>

               <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-green hover:bg-teal text-crust font-black py-3.5 rounded-xl mt-2 border-b-4 border-teal active:translate-y-1 active:border-b-0 flex items-center justify-center gap-2 shadow-sm transition-all">
                 <Plus size={20} strokeWidth={3}/> Tambah!
               </motion.button>
            </motion.form>
          )}
        </AnimatePresence>

        <motion.button 
          whileHover={{ scale: 1.1, rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsAddingTask(!isAddingTask)}
          className={`w-16 h-16 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.5)] border-4 flex items-center justify-center text-crust transition-all duration-300 z-50 ${isAddingTask ? 'bg-red border-maroon rotate-45 hover:rotate-[225deg]' : 'bg-blue border-sapphire hover:bg-sapphire'}`}
        >
          <Plus size={32} strokeWidth={4} />
        </motion.button>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #45475a; border-radius: 20px; }
      `}</style>
    </div>
  );
}
