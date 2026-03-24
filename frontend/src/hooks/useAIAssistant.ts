import { useState, useRef, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { AiTaskDraft } from "@/types";
import { DONE_COLUMN } from "@/lib/constants";

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  text: string;
  tasks?: AiTaskDraft[];
}

export function useAIAssistant(boardColumns: string[], onTasksSaved: () => void) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "init", role: "ai", text: "Hello! Ada yang bisa saya bantu hari ini?" }
  ]);
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, generating]);

  const handleSend = async () => {
    if (!input.trim() || generating) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setGenerating(true);

    try {
      // Call existing API
      const gTasks = await fetchApi("/api/generate-tasks", {
        method: "POST",
        body: JSON.stringify({ goal: userMsg.text }),
      });
      
      const defaultCategory = boardColumns.find((c) => c !== DONE_COLUMN) || "To Do";
      const populatedTasks = gTasks.map((t: AiTaskDraft) => ({ ...t, category: defaultCategory }));

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: "Baik saya buatkan klik setuju jika ini sesuai dengan keinginan anda. berikut listnya...",
        tasks: populatedTasks
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "ai",
        text: "Maaf, terjadi kesalahan saat mencoba membuat tugas. Coba lagi nanti."
      }]);
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdateTask = (messageId: string, taskIndex: number, field: string, value: string | number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.tasks) {
        const newTasks = [...msg.tasks];
        newTasks[taskIndex] = { ...newTasks[taskIndex], [field]: value };
        return { ...msg, tasks: newTasks };
      }
      return msg;
    }));
  };

  const handleRemoveTask = (messageId: string, taskIndex: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.tasks) {
        return { ...msg, tasks: msg.tasks.filter((_, i) => i !== taskIndex) };
      }
      return msg;
    }));
  };

  const handleSaveTasks = async (messageId: string) => {
    const msg = messages.find(m => m.id === messageId);
    if (!msg || !msg.tasks || msg.tasks.length === 0) return;

    try {
      for (const t of msg.tasks) {
        await fetchApi("/tasks", {
          method: "POST",
          body: JSON.stringify({
            title: t.title,
            reward_coins: t.reward_coins,
            is_ai_generated: true,
            category: t.category,
          }),
        });
      }
      // Remove tasks from the chat message now that they are saved
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, tasks: [] } : m));
      onTasksSaved(); // Trigger parent completely reloading dashboard
    } catch {
      alert("Failed to save tasks.");
    }
  };

  return {
    messages,
    input,
    setInput,
    generating,
    handleSend,
    handleUpdateTask,
    handleRemoveTask,
    handleSaveTasks,
    bottomRef
  };
}
