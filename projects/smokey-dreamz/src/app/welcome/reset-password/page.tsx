"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });
    
    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }
    
    setSuccess(true);
    setLoading(false);
    
    setTimeout(() => {
      router.push("/welcome");
    }, 2000);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-zinc-500">Loading...</div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-dark/30 via-transparent to-transparent" />
        <div className="w-full max-w-sm relative z-10">
          <div className="bg-[#1a1a1a] border border-green-500/30 rounded-xl p-8 text-center">
            <Check className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl text-white mb-2">Password Reset!</h2>
            <p className="text-zinc-400 text-sm">Redirecting to login...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-dark/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
      
      <div className="w-full max-w-sm relative z-10">
        <div className="flex items-center justify-center gap-3 mb-8 pl-4">
          <span className="font-serif text-2xl text-[#c5a059]">SMOKEY DREAMZ</span>
        </div>
        
        <div className="bg-[#1a1a1a] border border-[rgba(197,160,89,0.2)] rounded-xl p-8">
          <h2 className="text-2xl text-white mb-2 text-center">Reset Password</h2>
          <p className="text-zinc-500 text-sm mb-6 text-center">Enter your new password</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-background/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            
            {error && (
              <p className="text-red-400 text-xs text-center">{error}</p>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-accent hover:bg-accent-light text-white font-medium tracking-wide rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Please wait..." : "Reset Password"}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <a href="/welcome" className="text-zinc-400 hover:text-white text-sm">
              Back to Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}