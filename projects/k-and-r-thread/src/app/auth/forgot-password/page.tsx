"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { resetPassword } from "@/lib/supabase";
import { Loader2, Check } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-gold" />
          </div>
          <h2
            className="font-playfair text-3xl text-charcoal mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Check Your Email
          </h2>
          <p className="text-charcoal/60 mb-6">
            We&apos;ve sent password reset instructions to{" "}
            <span className="text-charcoal font-medium">{email}</span>.
            <br />
            Please check your inbox.
          </p>
          <Link
            href="/auth/login"
            className="text-gold hover:text-gold-dark transition-colors"
          >
            Return to Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

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
            Reset Password
          </h1>
          <p className="text-charcoal/60 mt-4 text-sm">
            Enter your email and we&apos;ll send reset instructions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors text-charcoal"
              placeholder="your@email.com"
            />
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
                Sending...
              </>
            ) : (
              "Send Reset Email"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-gold hover:text-gold-dark transition-colors"
          >
            Return to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}