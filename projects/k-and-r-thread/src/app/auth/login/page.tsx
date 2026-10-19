"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/supabase";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signIn(email, password);
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bone flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <p className="text-gold text-xs tracking-[0.3em] mb-4">THE DIGITAL ATELIER</p>
          <h1
            className="font-playfair text-4xl text-charcoal"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Welcome Back
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-charcoal tracking-[0.2em] mb-2">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors text-charcoal"
              placeholder="you@studio.com"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-charcoal tracking-[0.2em]">
                PASSWORD
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-xs text-gold hover:text-gold-dark transition-colors"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors text-charcoal pr-10"
                placeholder="Your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-600 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-charcoal text-bone hover:bg-charcoal/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-charcoal/60">
            New to K&R?{" "}
            <Link
              href="/auth/signup"
              className="text-gold hover:text-gold-dark transition-colors"
            >
              Create Account
            </Link>
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-platinum text-center">
          <Link href="/" className="text-xs text-charcoal/40 hover:text-charcoal/60 transition-colors">
            Return to Atelier
          </Link>
        </div>
      </motion.div>
    </div>
  );
}