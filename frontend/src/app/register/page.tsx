"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { Loader2, Mail, Lock, User, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import ErrorMessage from "@/components/ui/ErrorMessage";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "", species: "kucing" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          species: form.species
        })
      });
      router.push("/login");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
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
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-surface0 p-8 rounded-3xl border-2 border-surface1 shadow-2xl w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue/10 text-blue rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue/30">
            <Sparkles size={32} />
          </div>
          <h1 className="text-3xl font-black text-mauve tracking-tight">Join the Quest!</h1>
          <p className="text-subtext0 mt-2 font-medium">Create your account to start playing.</p>
        </div>

        <ErrorMessage message={error} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext0" size={20} />
            <input 
              type="text" 
              required
              placeholder="Username" 
              className="w-full bg-surface1 text-text border-2 border-surface2 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue focus:bg-surface2/50 transition-colors font-medium placeholder:text-subtext0"
              value={form.username}
              onChange={e => setForm({...form, username: e.target.value})}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext0" size={20} />
            <input 
              type="email" 
              required
              placeholder="Email address" 
              className="w-full bg-surface1 text-text border-2 border-surface2 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue focus:bg-surface2/50 transition-colors font-medium placeholder:text-subtext0"
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
              className="w-full bg-surface1 text-text border-2 border-surface2 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue focus:bg-surface2/50 transition-colors font-medium placeholder:text-subtext0"
              value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-subtext0" size={20} />
            <input 
              type="password" 
              required
              placeholder="Confirm Password" 
              className="w-full bg-surface1 text-text border-2 border-surface2 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue focus:bg-surface2/50 transition-colors font-medium placeholder:text-subtext0"
              value={form.confirmPassword}
              onChange={e => setForm({...form, confirmPassword: e.target.value})}
            />
          </div>


          <div className="pt-4 pb-1">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              disabled={loading}
              className="w-full bg-blue hover:bg-sapphire text-crust font-black text-lg py-3 rounded-xl transition-colors shadow-lg shadow-blue/20 flex items-center justify-center gap-2 border-b-4 border-sapphire active:border-b-0 active:translate-y-1 disabled:opacity-70 disabled:active:translate-y-0 disabled:active:border-b-4"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : "Create Account"}
            </motion.button>
          </div>
        </form>

        <p className="text-center mt-6 text-subtext0 font-medium">
          Already have an account? <Link href="/login" className="text-blue hover:text-sapphire font-bold underline decoration-2 underline-offset-4 transition-colors">Log in here</Link>
        </p>
      </motion.div>
    </div>
  );
}
