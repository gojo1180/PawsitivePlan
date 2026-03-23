"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Coins, LogOut, CheckCircle, Sparkles, Plus, RefreshCw, PenLine, Target, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  
  // Tasks State
  const [goal, setGoal] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiTasks, setAiTasks] = useState<any[]>([]);

  const [manualTask, setManualTask] = useState("");
  const [manualReward, setManualReward] = useState(10);

  const loadDashboard = async () => {
    try {
      const [petData, tasksData, shopData] = await Promise.all([
        fetchApi("/pets/me"),
        fetchApi("/tasks"),
        fetchApi("/shop"), // Added shop fetch for column 4
      ]);
      setData(petData);
      setTasks(tasksData);
      setShopItems(shopData);
    } catch (err) {
      router.push("/login");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return router.push("/login");
    loadDashboard();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.push("/login");
  };

  const completeTask = async (taskId: string) => {
    try {
      const res = await fetchApi(`/tasks/${taskId}/complete`, { method: "PATCH" });
      setData({ ...data, profile: { ...data.profile, coins: res.new_coins_balance }});
      setTasks(tasks.map(t => t.id === taskId ? { ...t, is_completed: true } : t));
    } catch (err) {
      alert("Failed to complete task");
    }
  };

  const addManualTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTask) return;
    try {
      await fetchApi("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: manualTask, reward_coins: manualReward, is_ai_generated: false })
      });
      setManualTask("");
      setManualReward(10);
      loadDashboard();
    } catch (err) {
      alert("Failed to add task.");
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
      setAiTasks(gTasks);
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
          body: JSON.stringify({ title: t.title, reward_coins: t.reward_coins, is_ai_generated: true })
        });
      }
      setAiTasks([]);
      setGoal("");
      loadDashboard();
    } catch (err) {
      alert("Failed to save tasks.");
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base text-mauve">
        <RefreshCw className="animate-spin" size={48} />
      </div>
    );
  }

  const { pet, profile, equipped_items } = data;
  const activeTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  return (
    <div className="min-h-screen bg-base flex flex-col">
      
      {/* Top Header - Habitica Style Profile Banner */}
      <header className="bg-surface0 border-b-4 border-surface1 shadow-sm px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20">
        
        {/* Left: Paper Doll & Stats */}
        <div className="flex items-center gap-6">
          {/* Paper Doll Thumbnail */}
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

          {/* User Info & Bars */}
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

        {/* Right: Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Quick Manual Task Add (Header) */}
          <form onSubmit={addManualTask} className="flex gap-2">
            <input 
              type="text" 
              required
              value={manualTask}
              onChange={(e) => setManualTask(e.target.value)}
              placeholder="Tambahkan Tugas..."
              className="bg-surface1 border-2 border-surface2 rounded-xl px-4 py-2.5 focus:outline-none focus:border-green font-medium text-sm w-full sm:w-64 placeholder:text-subtext0 focus:bg-base"
            />
            <div className="relative w-20 shrink-0 hidden sm:block">
               <Coins className="absolute left-2.5 top-1/2 -translate-y-1/2 text-yellow" size={14} />
               <input 
                 type="number" min="1" max="100" value={manualReward}
                 onChange={(e) => setManualReward(parseInt(e.target.value) || 0)}
                 className="w-full bg-surface1 border-2 border-surface2 rounded-xl py-2.5 pl-7 pr-2 focus:outline-none focus:border-yellow font-bold text-yellow text-sm focus:bg-base"
               />
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-green hover:bg-teal text-crust font-black px-4 rounded-xl transition-colors shrink-0 shadow-sm border-b-4 border-teal active:border-b-0 active:translate-y-1"
            >
              <Plus size={20} />
            </motion.button>
          </form>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout} 
            className="bg-red/10 text-red border-2 border-red/20 hover:bg-red hover:text-crust transition-colors px-4 py-2.5 rounded-xl cursor-pointer shadow-sm font-bold flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Logout
          </motion.button>
        </div>
      </header>

      {/* Main Kanban Board Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex gap-6 h-full min-w-max pb-4"
        >
          
          {/* Column 1: AI Quests (Habits replacement) */}
          <div className="w-[340px] flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b-2 border-surface1 pb-2">
              <h3 className="text-xl font-black text-blue flex items-center gap-2">
                <Target size={20} /> AI Quests
              </h3>
              <span className="bg-blue text-crust font-black text-xs px-2 py-0.5 rounded-full">{aiTasks.length > 0 ? aiTasks.length : '?'}</span>
            </div>
            
            <div className="bg-surface0 border-2 border-surface1 rounded-2xl p-4 flex-1 overflow-y-auto space-y-4 shadow-sm custom-scrollbar">
              <p className="text-sm font-medium text-subtext0 mb-2">Break down major goals into tasks:</p>
              <textarea 
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., I want to read 12 books this year"
                className="w-full bg-base border-2 border-surface2 rounded-xl px-3 py-3 focus:outline-none focus:border-blue placeholder:text-surface2 font-medium text-sm resize-none h-24"
              />
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGenerateAI}
                disabled={generating || !goal}
                className="w-full bg-blue hover:bg-sapphire text-crust font-black py-2.5 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center gap-2 border-b-4 border-sapphire active:border-b-0 active:translate-y-1 shadow-sm"
              >
                {generating ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />} Generate Quests
              </motion.button>

              <AnimatePresence>
                {aiTasks.map((t, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    className="bg-surface1 p-3 rounded-xl border-2 border-surface2 shadow-sm flex flex-col gap-2"
                  >
                    <span className="text-sm font-bold text-text leading-tight">{t.title}</span>
                    <div className="flex justify-between items-center mt-1">
                       <span className="text-[10px] bg-blue/20 text-blue px-2 py-0.5 rounded uppercase tracking-wider font-black">AI</span>
                       <span className="text-yellow font-black flex items-center gap-1 text-xs">
                         <Coins size={14} />{t.reward_coins}
                       </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {aiTasks.length > 0 && (
                <motion.button 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveAITasks} 
                  className="w-full bg-green hover:bg-teal text-crust font-black py-2.5 rounded-xl mt-2 flex justify-center items-center gap-2 border-b-4 border-teal active:border-b-0 active:translate-y-1 shadow-sm"
                >
                  <Plus size={18} /> Add All To Dashboard
                </motion.button>
              )}
            </div>
          </div>

          {/* Column 2: Active To-Do (Dailies/To-Do) */}
          <div className="w-[340px] flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b-2 border-surface1 pb-2">
              <h3 className="text-xl font-black text-peach flex items-center gap-2">
                <PenLine size={20} /> To Do
              </h3>
              <span className="bg-peach text-crust font-black text-xs px-2 py-0.5 rounded-full">{activeTasks.length}</span>
            </div>
            
            <div className="bg-surface0 border-2 border-surface1 rounded-2xl p-4 flex-1 overflow-y-auto space-y-3 shadow-sm custom-scrollbar">
              {activeTasks.length === 0 && (
                <div className="text-center py-10 text-subtext0 bg-base rounded-xl border-2 border-dashed border-surface2">
                  <p className="font-bold">No active quests.</p>
                  <p className="text-xs mt-1">Add one up top!</p>
                </div>
              )}
              <AnimatePresence>
                {activeTasks.map((task) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    key={task.id} 
                    className="flex flex-col bg-surface1 p-4 rounded-xl border-2 border-surface2 hover:border-peach focus-within:border-peach transition-colors group shadow-sm gap-3"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm text-text leading-tight">{task.title}</h4>
                      <motion.button 
                        whileHover={{ scale: 1.2, color: "#a6e3a1" }}
                        whileTap={{ scale: 0.8 }}
                        onClick={() => completeTask(task.id)}
                        className="text-surface2 group-hover:text-subtext0 hover:!text-green transition-colors shrink-0"
                        title="Complete Quest"
                      >
                        <CheckCircle size={24} />
                      </motion.button>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-surface2">
                      {task.is_ai_generated ? (
                        <span className="text-[10px] uppercase font-black tracking-widest bg-blue/10 text-blue px-2 py-0.5 rounded border border-blue/20">AI Generated</span>
                      ) : <span />}
                      <span className="text-yellow font-black flex items-center gap-1 text-xs">
                        <Coins size={14} /> {task.reward_coins}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="w-[340px] flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b-2 border-surface1 pb-2">
              <h3 className="text-xl font-black text-green flex items-center gap-2">
                <CheckCircle size={20} /> Selesai
              </h3>
              <span className="bg-green text-crust font-black text-xs px-2 py-0.5 rounded-full">{completedTasks.length}</span>
            </div>
            
            <div className="bg-surface0/60 border-2 border-surface1 rounded-2xl p-4 flex-1 overflow-y-auto space-y-3 shadow-sm custom-scrollbar">
              {completedTasks.length === 0 && (
                <div className="text-center py-10 text-subtext0 bg-base/50 rounded-xl border-2 border-dashed border-surface2">
                  <p className="font-bold">Nothing completed yet.</p>
                </div>
              )}
              <AnimatePresence>
                {completedTasks.map((task) => (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    key={task.id} 
                    className="flex justify-between items-center bg-base/80 p-3 rounded-xl border border-surface1 opacity-70"
                  >
                    <span className="text-subtext0 line-through font-medium text-sm line-clamp-2">{task.title}</span>
                    <CheckCircle size={20} className="text-green/50 shrink-0 ml-2" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Column 4: Shop Preview (Hadiah) */}
          <div className="w-[340px] flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b-2 border-surface1 pb-2">
              <h3 className="text-xl font-black text-mauve flex items-center gap-2 cursor-pointer hover:text-pink transition-colors" onClick={() => router.push("/shop")}>
                <ShoppingBag size={20} /> Hadiah Shop
              </h3>
            </div>
            
            <div className="bg-surface0 border-2 border-surface1 rounded-2xl p-4 flex-1 overflow-y-auto space-y-4 shadow-sm custom-scrollbar flex flex-col">
              <div className="flex-1 grid grid-cols-2 gap-3 auto-rows-max">
                {shopItems.slice(0, 8).map(item => (
                  <div key={item.id} className="bg-surface1 rounded-xl border-2 border-surface2 p-2 flex flex-col items-center group cursor-pointer" onClick={() => router.push("/shop")}>
                    <div className="w-full aspect-square bg-base rounded-lg mb-2 p-2 border border-surface2 flex items-center justify-center">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    </div>
                    <div className="flex items-center justify-center gap-1 font-black text-xs text-yellow mt-auto">
                       <Coins size={12} /> {item.price}
                    </div>
                  </div>
                ))}
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push("/shop")}
                className="w-full bg-mauve hover:bg-pink text-crust font-black py-3 rounded-xl transition-all flex justify-center items-center gap-2 border-b-4 border-pink active:border-b-0 active:translate-y-1 mt-auto shadow-sm"
              >
                Go to Full Shop
              </motion.button>
            </div>
          </div>

        </motion.div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #45475a; 
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
