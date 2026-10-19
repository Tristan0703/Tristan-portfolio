"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import { getFabricById, yardageRecommendations } from "@/lib/fabrics";

interface RequestQuoteProps {
  fabricId: string;
  fabricName: string;
  composition: string;
  weight: string;
  swatchImage: string;
  onClose: () => void;
}

interface QuoteData {
  garmentIntended: string;
  name: string;
  email: string;
  company: string;
  notes: string;
}

const garmentOptions = [
  { id: "trousers", label: "Trousers" },
  { id: "waistcoat", label: "Waistcoat" },
  { id: "full-overcoat", label: "Full Overcoat" },
  { id: "jacket", label: "Tailored Jacket" },
  { id: "suit-jacket", label: "Suit Jacket" },
  { id: "three-piece-suit", label: "Three-Piece Suit" },
  { id: "evening-coat", label: "Evening Coat" },
  { id: "dress", label: "Dress" },
  { id: "gown", label: "Full Length Gown" },
  { id: "blouse", label: "Blouse" },
  { id: "shirt", label: "Classic Shirt" },
  { id: "sweater", label: "Sweater" },
  { id: "scarf", label: "Scarf" },
  { id: "stole", label: "Stole" },
];

const initialData: QuoteData = {
  garmentIntended: "",
  name: "",
  email: "",
  company: "",
  notes: "",
};

export default function RequestQuote({
  fabricId,
  fabricName,
  composition,
  weight,
  swatchImage,
  onClose,
}: RequestQuoteProps) {
  const [data, setData] = useState<QuoteData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const fabric = getFabricById(fabricId);
  const selectedGarment = garmentOptions.find((g) => g.id === data.garmentIntended);
  
  const recommendedYardage = useMemo(() => {
    if (!data.garmentIntended) return null;
    if (fabric?.garmentYardage[data.garmentIntended]) {
      return fabric.garmentYardage[data.garmentIntended];
    }
    return yardageRecommendations[data.garmentIntended] || null;
  }, [data.garmentIntended, fabric]);

  const updateField = <K extends keyof QuoteData>(field: K, value: QuoteData[K]) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch("/api/bespoke-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fabricId,
          fabricName,
          garmentType: data.garmentIntended,
          name: data.name,
          email: data.email,
          company: data.company,
          notes: data.notes,
          recommendedYardage,
        }),
      });
      setIsSuccess(true);
    } catch (err) {
      console.error("Submission failed", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = data.garmentIntended && data.name && data.email;

  if (isSuccess) {
    return (
      <div className="p-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-gold text-xs tracking-[0.3em] mb-4">INQUIRY RECEIVED</p>
          <h3
            className="font-playfair text-2xl text-charcoal mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            The Atelier has been notified.
          </h3>
          <p className="text-charcoal/60 mb-6">
            A specialist will respond within 24 hours.
          </p>
          <button
            onClick={onClose}
            className="text-sm text-charcoal/50 hover:text-charcoal transition-colors"
          >
            Close
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 border-b border-platinum">
        <div>
          <p className="text-gold text-xs tracking-[0.2em]">REQUEST QUOTE</p>
          <h3
            className="font-playfair text-xl text-charcoal mt-1"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {fabricName}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-platinum/50 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-charcoal" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex gap-6">
          <div className="w-24 h-24 flex-shrink-0 bg-platinum/30 overflow-hidden">
            <img
              src={swatchImage}
              alt={`Swatch: ${fabricName}`}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-xs text-charcoal/50 tracking-[0.15em] mb-1">
              COMPOSITION
            </p>
            <p className="text-sm text-charcoal mb-3">{composition}</p>
            <p className="text-xs text-charcoal/50 tracking-[0.15em] mb-1">
              WEIGHT
            </p>
            <p className="text-sm text-charcoal">{weight}</p>
          </div>
        </div>

        <div className="border-t border-platinum pt-6 space-y-6">
          <div>
            <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
              GARMENT INTENDED *
            </label>
            <select
              value={data.garmentIntended}
              onChange={(e) => updateField("garmentIntended", e.target.value)}
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors"
            >
              <option value="">Select garment type</option>
              {garmentOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>

            <AnimatePresence>
              {selectedGarment && recommendedYardage && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-gold/10 border border-gold/30"
                >
                  <p className="text-xs text-charcoal/50 tracking-[0.15em] mb-1">
                    TAILOR&apos;S RECOMMENDATION
                  </p>
                  <p className="text-charcoal">
                    <span className="text-xl text-gold font-playfair" style={{ fontFamily: "var(--font-playfair)" }}>
                      {recommendedYardage}
                    </span>
                    <span className="text-sm ml-2">recommended</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
              NAME *
            </label>
            <input
              type="text"
              value={data.name}
              onChange={(e) => updateField("name", e.target.value)}
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
              EMAIL *
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => updateField("email", e.target.value)}
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
              COMPANY (OPTIONAL)
            </label>
            <input
              type="text"
              value={data.company}
              onChange={(e) => updateField("company", e.target.value)}
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
              NOTES
            </label>
            <textarea
              value={data.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
              placeholder="Additional requirements or specifications..."
              className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      <div className="p-6 border-t border-platinum">
        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="group w-full py-4 bg-charcoal text-bone hover:bg-[#B89150] disabled:opacity-50 transition-colors duration-500 flex items-center justify-center gap-3"
        >
          <span className="tracking-[0.15em] text-sm">
            {isSubmitting ? "Sending..." : "Send Consultation Request"}
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}