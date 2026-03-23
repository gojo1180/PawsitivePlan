"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { LogIn, UserPlus, PawPrint, Loader2 } from "lucide-react";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
    species: "cat", // Default pet species for new users
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        // Standard JWT token login flow hitting our FastAPI backend
        const res = await fetchApi("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email: formData.email, password: formData.password }),
        });
        
        if (res.access_token) {
          localStorage.setItem("access_token", res.access_token);
          // Auto route to interactive dashboard
          router.push("/dashboard");
        }
      } else {
        // Complete Profile and Pet Registration natively
        const res = await fetchApi("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            username: formData.username,
            species: formData.species,
          }),
        });
        
        if (res.user_id) {
          // Send user back to login so they easily get their new access token
          setIsLogin(true);
          setError("Registered successfully! Please log in.");
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface0 w-full max-w-md p-8 rounded-2xl shadow-xl shadow-crust/50 border border-surface1">
        
        {/* Header Visuals */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-surface1 rounded-2xl flex items-center justify-center mb-4 text-mauve">
            {isLogin ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h1 className="text-3xl font-bold text-text">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-subtext0 mt-2 text-center">
            {isLogin 
              ? "Ready to crush your goals and feed your pet?" 
              : "Join to turn productivity into a game."}
          </p>
        </div>

        {error && (
          <div className="bg-red/10 border border-red text-red p-3 rounded-xl mb-6 text-sm text-center">
            {error}
          </div>
        )}

        {/* Dynamic Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {!isLogin && (
            <div>
              <label className="block text-subtext1 mb-1 text-sm">Username</label>
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full bg-base border border-surface1 text-text rounded-xl p-3 focus:outline-none focus:border-mauve transition-colors"
                placeholder="ProductivityKing"
              />
            </div>
          )}

          <div>
            <label className="block text-subtext1 mb-1 text-sm">Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-base border border-surface1 text-text rounded-xl p-3 focus:outline-none focus:border-mauve transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-subtext1 mb-1 text-sm">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-base border border-surface1 text-text rounded-xl p-3 focus:outline-none focus:border-mauve transition-colors"
              placeholder="••••••••"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-subtext1 mb-1 text-sm flex items-center gap-2">
                <PawPrint size={16} /> Choose Pet Species
              </label>
              <select
                name="species"
                value={formData.species}
                onChange={handleChange}
                className="w-full bg-base border border-surface1 text-text rounded-xl p-3 focus:outline-none focus:border-mauve transition-colors appearance-none"
              >
                <option value="cat">Cat</option>
                <option value="dog">Dog</option>
                <option value="dragon">Dragon</option>
                <option value="bird">Bird</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mauve hover:bg-lavender text-crust font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        {/* Toggle Mode Button */}
        <div className="mt-6 text-center text-sm text-subtext0">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(""); // Reset context so they don't see previous alerts
            }}
            className="text-mauve hover:text-lavender font-semibold underline underline-offset-4"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </div>

      </div>
    </div>
  );
}
