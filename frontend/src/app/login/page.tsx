"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Loader2, Mail, Lock, Gamepad2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify(form)
      });
      localStorage.setItem("access_token", res.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid credentials";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base p-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-surface0 p-8 rounded-3xl border-2 border-surface1 shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green/10 text-green rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green/30">
            <Gamepad2 size={32} />
          </div>
          <h1 className="text-3xl font-black text-mauve tracking-tight">Welcome Back!</h1>
          <p className="text-subtext0 mt-2 font-medium">Ready to level up your productivity?</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext0" size={20} />
            <input 
              type="email" 
              required
              placeholder="Email address" 
              className="w-full bg-surface1 text-text border-2 border-surface2 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-green focus:bg-surface2/50 transition-colors font-medium placeholder:text-subtext0"
              value={form.email}
              onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext0" size={20} />
            <input 
              type="password" 
              required
              placeholder="Password" 
              className="w-full bg-surface1 text-text border-2 border-surface2 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-green focus:bg-surface2/50 transition-colors font-medium placeholder:text-subtext0"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>

          <div className="pt-4 pb-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full bg-green hover:bg-teal text-crust font-black text-lg py-3 rounded-xl transition-colors shadow-lg shadow-green/20 flex items-center justify-center gap-2 border-b-4 border-teal active:border-b-0 active:translate-y-1 disabled:opacity-70 disabled:active:translate-y-0 disabled:active:border-b-4"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : "Login & Play"}
            </motion.button>
          </div>
        </form>

        <p className="text-center mt-6 text-subtext0 font-medium">
          Don&apos;t have an account? <Link href="/register" className="text-green hover:text-teal font-bold underline decoration-2 underline-offset-4 transition-colors">Create one here</Link>
        </p>
      </motion.div>
    </div>
  );
}
