"use client";

import { useState, useEffect } from "react";
import { Check, Mail, Lock, User, ArrowRight, CreditCard, Phone, Eye, EyeOff } from "lucide-react";
import { signUp, signInWithPassword, getMember } from "@/components/membership";

export default function WelcomePage() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    idNumber: "",
    contactNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const sessionKey = `sb-${encodeURIComponent(supabaseUrl)}-auth-token`;
      const stored = localStorage.getItem(sessionKey);
      const verified = document.cookie.includes("age-verified=true");
      if (stored && verified) {
        window.location.href = "/";
      }
    };
    checkSession();
  }, []);

  const handleAgeConfirm = () => {
    setAgeConfirmed(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const doAuth = async () => {
      let result;

      try {
        if (!isLogin) {
          // Sanitize inputs - allow unicode letters, numbers, spaces, and common name characters
          const cleanName = formData.name.trim().replace(/[^\p{L}\p{N}\s'\-.]/gu, '');
          const cleanId = formData.idNumber.replace(/[^\d]/g, '');
          const cleanContact = formData.contactNumber.replace(/[^\d]/g, '');
          
          if (!cleanName || cleanName.length < 2) {
            setError("Please enter your full name");
            setIsLoading(false);
            return;
          }
          if (!cleanId || cleanId.length < 5) {
            setError("Please enter a valid ID number");
            setIsLoading(false);
            return;
          }
          if (!cleanContact || cleanContact.length < 10) {
            setError("Please enter a valid contact number");
            setIsLoading(false);
            return;
          }
          if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
          }
          if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            setIsLoading(false);
            return;
          }

          result = await signUp(cleanName, formData.email, cleanId, cleanContact, formData.password);
          
          if (!result.success) {
            setError(result.error || "Failed to create account");
            setIsLoading(false);
            return;
          }
        } else {
          if (!formData.email.trim() || !formData.email.includes('@')) {
            setError("Please enter a valid email");
            setIsLoading(false);
            return;
          }
          if (!formData.password.trim()) {
            setError("Please enter your password");
            setIsLoading(false);
            return;
          }

          if (resetMode) {
            const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
            const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
            
            try {
              const response = await fetch(`${supabaseUrl}/auth/v1/recover`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': anonKey,
                },
                body: JSON.stringify({
                  email: formData.email.trim(),
                }),
              });
              
              // Supabase returns 200 even if email doesn't exist (security)
              // But returns 400 if invalid email format
              if (response.ok || response.status === 400) {
                setError("");
                setFormData({ ...formData, password: "", confirmPassword: "" });
                alert("If that email exists, a password reset link has been sent.");
                setResetMode(false);
              } else {
                const errData = await response.json();
                setError(errData.msg || "Failed to send reset link");
              }
              setIsLoading(false);
              return;
            } catch (err) {
              // Network error
              alert("If that email exists, a password reset link has been sent.");
              setResetMode(false);
              setIsLoading(false);
              return;
            }
          }

          result = await signInWithPassword(formData.email.trim(), formData.password);
          
          if (!result.success) {
            setError(result.error || "Failed to sign in");
            setIsLoading(false);
            return;
          }
        }

const memberId = result?.member?.id;

        document.cookie = `age-verified=true; path=/; max-age=${60 * 60 * 24 * 365}`;

        if (memberId) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
          const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/members?id=eq.${memberId}&select=is_admin`, {
              headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` },
            });
            const data = await response.json();
            if (data?.[0]?.is_admin) {
              window.location.href = "/staff/verify";
              return;
            }
          } catch {}
        }

        window.location.href = "/";
      } catch {
        setError("An unexpected error occurred. Please try again.");
        setIsLoading(false);
      }
    };

    doAuth();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent-dark/30 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gold/5 via-transparent to-transparent" />
      
      <div className="w-full max-w-sm relative z-10">
        {!ageConfirmed ? (
          <div className="text-center animate-fade-in">
            <div className="mb-10 lg:mb-12">
              <div className="flex items-center justify-center gap-3 mb-4 pl-4">
                <img 
                  src="/logo.png" 
                  alt="Smokey Dreamz" 
                  className="h-10 lg:h-12 w-auto object-contain"
                />
                <span className="font-serif text-xl lg:text-2xl text-[#c5a059]">SMOKEY DREAMZ</span>
              </div>
              <p className="text-zinc-500 text-xs tracking-[0.25em] uppercase">Premium Cannabis Experience</p>
            </div>

            <div className="bg-[#1a1a1a] border border-[rgba(197,160,89,0.2)] rounded-xl p-8 lg:p-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <p className="text-zinc-300 text-lg lg:text-xl mb-8 leading-relaxed">Are you 21 or older?</p>
              
              <button
                onClick={handleAgeConfirm}
                className="w-full py-3.5 lg:py-4 px-6 bg-accent hover:bg-accent-light text-white font-medium tracking-wide rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] border border-[rgba(197,160,89,0.3)]"
              >
                Yes, Enter
              </button>
              
              <p className="text-zinc-600 text-xs mt-6 lg:mt-8 leading-relaxed">
                By entering, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            <p className="text-zinc-700 text-xs mt-8 lg:mt-10 tracking-wide">
              This website contains information intended for adults 21+
            </p>
          </div>
        ) : (
          <div className="animate-scale-in">
            <div className="flex items-center justify-center gap-3 mb-8 pl-4">
              <img 
                src="/logo.png" 
                alt="Smokey Dreamz" 
                className="h-10 lg:h-12 w-auto object-contain"
              />
              <span className="font-serif text-xl lg:text-2xl text-[#c5a059]">SMOKEY DREAMZ</span>
            </div>

            <div className="text-center mb-8 lg:mb-10">
              <h2 className="font-serif text-3xl lg:text-4xl text-white mb-2 leading-relaxed">
                {isLogin ? "Welcome Back" : "Join the Dream"}
              </h2>
              <p className="text-zinc-500 text-sm">
                {isLogin ? "Sign in to your account" : "Become a member"}
              </p>
            </div>

            <div className="bg-[#1a1a1a] border border-[rgba(197,160,89,0.2)] rounded-xl p-6 lg:p-8 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
              <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
                {!isLogin && (
                  <div className="relative animate-fade-in">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleInputChange}
                      autoComplete="name"
                      className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                )}

                {!isLogin && (
                  <div className="relative animate-fade-in animation-delay-100">
                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      name="idNumber"
                      placeholder="SA ID Number (For compliance only)"
                      value={formData.idNumber}
                      onChange={handleInputChange}
                      maxLength={13}
                      autoComplete="off"
                      className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                )}

                {!isLogin && (
                  <div className="relative animate-fade-in animation-delay-100">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="tel"
                      name="contactNumber"
                      placeholder="Contact Number (e.g. 0821234567)"
                      value={formData.contactNumber}
                      onChange={handleInputChange}
                      maxLength={10}
                      autoComplete="tel"
                      className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder={resetMode ? "New Password" : "Password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete={resetMode ? "new-password" : "current-password"}
                    className="w-full pl-12 pr-12 py-3.5 bg-background/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold transition-colors"
                  />
                  {!resetMode && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {isLogin && !resetMode && (
                  <div className="text-right -mt-2">
                    <button
                      type="button"
                      onClick={() => setResetMode(true)}
                      className="text-zinc-500 hover:text-gold text-xs transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                {!isLogin && (
                  <div className="relative animate-fade-in animation-delay-100">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      autoComplete="new-password"
                      className="w-full pl-12 pr-4 py-3.5 bg-background/50 border border-white/10 rounded-xl text-white placeholder-zinc-600 text-sm focus:outline-none focus:border-gold transition-colors"
                    />
                  </div>
                )}

                {error && (
                  <p className="text-red-400 text-xs text-center py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 lg:py-4 px-6 bg-accent hover:bg-accent-light text-white font-medium tracking-wide rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 border border-[rgba(197,160,89,0.3)] hover:border-gold mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    "Please wait..."
                  ) : resetMode ? (
                    <>
                      Send Reset Link
                      <Mail className="w-4 h-4" />
                    </>
                  ) : isLogin ? (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {resetMode ? (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setResetMode(false);
                      setError("");
                    }}
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                    }}
                    className="text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    {isLogin ? (
                      <>New here? <span className="text-gold">Join the Dream</span></>
                    ) : (
                      <>Already a member? <span className="text-gold">Sign In</span></>
                    )}
                  </button>
                </div>
              )}

              {!isLogin && (
                <div className="mt-6 p-4 bg-background/30 rounded-xl border border-[rgba(197,160,89,0.15)] animate-fade-in animation-delay-200">
                  <p className="text-zinc-400 text-xs mb-3 font-medium tracking-wider uppercase">Membership Benefits:</p>
                  <ul className="space-y-2">
                    {["Exclusive strain releases", "Priority quotations", "Members-only events"].map((benefit) => (
                      <li key={benefit} className="flex items-center gap-2 text-zinc-500 text-xs">
                        <Check className="w-3 h-3 text-gold" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
