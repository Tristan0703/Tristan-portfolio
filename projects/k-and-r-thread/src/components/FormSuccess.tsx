"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download } from "lucide-react";

interface FormSuccessProps {
  referenceNumber: string;
  fabricName: string;
  fabricId: string;
  onClose: () => void;
}

export default function FormSuccess({ referenceNumber, fabricName, fabricId, onClose }: FormSuccessProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate-swatch-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fabricId, fabricName, referenceNumber }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `KR-Swatch-${referenceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="mb-12"
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          className="text-gold"
        >
          <motion.path
            d="M60 10 L60 90"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.5, duration: 1.5 }}
          />
          <motion.path
            d="M55 85 Q60 95 65 85"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1, duration: 1 }}
          />
          <motion.circle
            cx="60"
            cy="10"
            r="4"
            fill="currentColor"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ delay: 1.3, duration: 0.4 }}
          />
          <motion.path
            d="M30 30 Q30 60 60 60 Q90 60 90 30"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          />
          <motion.path
            d="M30 30 L30 45 Q30 60 45 60 L60 60"
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          />
        </svg>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xs text-gold tracking-[0.3em] mb-4">
          {referenceNumber}
        </p>
        <h2
          className="font-playfair text-3xl text-charcoal mb-4"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          The Atelier has been notified.
        </h2>
        <p className="text-charcoal/60 max-w-md mb-8">
          Your inquiry has been received by the K&R Atelier. A specialist will review your 
          project requirements and respond within 24 hours.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-4"
      >
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="group flex items-center gap-3 px-8 py-4 border border-gold text-gold hover:bg-gold hover:text-charcoal transition-colors duration-500"
        >
          <Download className="w-4 h-4" />
          <span className="tracking-[0.15em] text-sm">
            {isGenerating ? "Generating..." : "Download Digital Swatch Sheet"}
          </span>
        </button>

        <button
          onClick={onClose}
          className="text-sm text-charcoal/50 hover:text-charcoal transition-colors"
        >
          Return to Collection
        </button>
      </motion.div>
    </motion.div>
  );
}