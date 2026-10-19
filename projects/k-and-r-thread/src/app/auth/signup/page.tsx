"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/supabase";
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    company: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "At least 8 characters" },
    { met: /[A-Z]/.test(formData.password), text: "One uppercase letter" },
    { met: /[a-z]/.test(formData.password), text: "One lowercase letter" },
    { met: /[0-9]/.test(formData.password), text: "One number" },
  ];

  const allRequirementsMet = passwordRequirements.every((req) => req.met);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }

    setIsLoading(true);

    try {
      await signUp(formData.email, formData.password, formData.fullName);
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
            Welcome to K&R
          </h2>
          <p className="text-charcoal/60 mb-6">
            Check your email at{" "}
            <span className="text-charcoal font-medium">{formData.email}</span>
            <br />
            and click the link to verify your account.
          </p>
          <Link
            href="/auth/login"
            className="text-gold hover:text-gold-dark transition-colors"
          >
            Sign In
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
            Create Account
          </h1>
          <p className="text-charcoal/60 mt-4 text-sm">
            Join to browse and request fabric samples
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-charcoal tracking-[0.2em] mb-2">
              NAME
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors text-charcoal"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-xs text-charcoal tracking-[0.2em] mb-2">
              EMAIL
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors text-charcoal"
              placeholder="you@studio.com"
            />
          </div>

          <div>
            <label className="block text-xs text-charcoal tracking-[0.2em] mb-2">
              COMPANY (OPTIONAL)
            </label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => updateField("company", e.target.value)}
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors text-charcoal"
              placeholder="Your studio"
            />
          </div>

          <div>
            <label className="block text-xs text-charcoal tracking-[0.2em] mb-2">
              PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => updateField("password", e.target.value)}
                required
                className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors text-charcoal pr-10"
                placeholder="Choose a password"
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

            <div className="mt-3 space-y-2">
              {passwordRequirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      req.met
                        ? "border-gold bg-gold text-charcoal"
                        : "border-charcoal/30"
                    }`}
                  >
                    {req.met && <Check className="w-3 h-3" />}
                  </div>
                  <span className={req.met ? "text-charcoal" : "text-charcoal/40"}>
                    {req.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs text-charcoal tracking-[0.2em] mb-2">
              CONFIRM PASSWORD
            </label>
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              required
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors text-charcoal"
              placeholder="Confirm password"
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
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-charcoal/60">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-gold hover:text-gold-dark transition-colors"
            >
              Sign In
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