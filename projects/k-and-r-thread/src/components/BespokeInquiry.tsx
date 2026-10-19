"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface BespokeInquiryProps {
  fabricId: string;
  fabricName: string;
  fabricImage: string;
  onClose: () => void;
}

interface InquiryData {
  garmentType: string;
  measurements: string;
  liningRequired: boolean;
  interfacingRequired: boolean;
  name: string;
  email: string;
  company: string;
  notes: string;
}

const garmentYardage: Record<string, { meters: number; note: string }> = {
  "full-3-piece-suit": { meters: 4.0, note: "Based on standard 150cm width" },
  "evening-gown-full": { meters: 6.0, note: "Full-length with train allowance" },
  "classic-shirt": { meters: 2.0, note: "Classic fit with pattern match" },
  "tailored-blazer": { meters: 2.5, note: "Unlined construction" },
  "trench-coat": { meters: 3.0, note: "Full-length with storm flap" },
  "silk-dress": { meters: 3.5, note: "Bias-cut construction" },
};

const liningOptions = [
  { id: "silk charmeuse", label: "Silk Charmeuse" },
  { id: "cupro bemberg", label: "Cupro Bemberg" },
  { id: "acetate", label: "Acetate" },
  { id: "none", label: "No Lining" },
];

const initialData: InquiryData = {
  garmentType: "",
  measurements: "",
  liningRequired: false,
  interfacingRequired: false,
  name: "",
  email: "",
  company: "",
  notes: "",
};

export default function BespokeInquiry({
  fabricId,
  fabricName,
  fabricImage,
  onClose,
}: BespokeInquiryProps) {
  const [data, setData] = useState<InquiryData>(initialData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const selectedYardage = data.garmentType
    ? garmentYardage[data.garmentType]
    : null;

  const updateField = <K extends keyof InquiryData>(
    field: K,
    value: InquiryData[K]
  ) => {
    setData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bespoke-inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          fabricId,
          recommendedYardage: selectedYardage?.meters,
        }),
      });
      const result = await res.json();
      setReferenceNumber(result.referenceNumber);
      setIsSuccess(true);
    } catch {
      console.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid =
    data.garmentType && data.name && data.email;

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-gold text-xs tracking-[0.3em] mb-4">
            {referenceNumber}
          </p>
          <h3
            className="font-playfair text-2xl text-charcoal mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            The Atelier has been notified.
          </h3>
          <p className="text-charcoal/60 mb-8">
            A specialist will review your tailoring requirements
            <br />
            and respond within 24 hours.
          </p>
          <button
            onClick={onClose}
            className="text-sm text-charcoal/50 hover:text-charcoal transition-colors"
          >
            Return to Collection
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-xl mx-auto">
      <p className="text-gold text-xs tracking-[0.3em] mb-4">BESPOKE INQUIRY</p>
      <h2
        className="font-playfair text-2xl text-charcoal mb-2"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {fabricName}
      </h2>
      <p className="text-sm text-charcoal/60 mb-8">
        Custom tailoring consultation
      </p>

      <div className="space-y-8">
        <div>
          <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
            GARMENT SELECTION
          </label>
          <select
            value={data.garmentType}
            onChange={(e) => updateField("garmentType", e.target.value)}
            className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors"
          >
            <option value="">Select garment type</option>
            {Object.entries(garmentYardage).map(([key, _]) => (
              <option key={key} value={key}>
                {key
                  .split("-")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ")}
              </option>
            ))}
          </select>

          <AnimatePresence>
            {selectedYardage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-4 p-4 bg-gold/10 border border-gold/30"
              >
                <p className="text-xs text-charcoal/50 tracking-[0.15em] mb-1">
                  TAILOR&apos;S RECOMMENDATION
                </p>
                <p className="text-charcoal">
                  <span className="text-xl text-gold font-playfair" style={{ fontFamily: "var(--font-playfair)" }}>
                    {selectedYardage.meters}
                  </span>
                  <span className="text-sm ml-1">meters recommended</span>
                </p>
                <p className="text-xs text-charcoal/50 mt-1">
                  {selectedYardage.note}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
            CLIENT MEASUREMENTS (OPTIONAL)
          </label>
          <textarea
            value={data.measurements}
            onChange={(e) => updateField("measurements", e.target.value)}
            rows={3}
            placeholder="Chest: ___\nWaist: ___\nHips: ___\nHeight: ___"
            className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none transition-colors resize-none font-mono text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-3">
            LINING &amp; INTERFACING REQUIREMENTS
          </label>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.liningRequired}
                onChange={(e) => updateField("liningRequired", e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 border rounded-full flex items-center justify-center transition-colors ${
                  data.liningRequired
                    ? "border-gold bg-gold"
                    : "border-charcoal/30"
                }`}
              >
                {data.liningRequired && (
                  <div className="w-2 h-2 rounded-full bg-bone" />
                )}
              </div>
              <span className="text-sm text-charcoal">Full Lining Required</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={data.interfacingRequired}
                onChange={(e) => updateField("interfacingRequired", e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 border rounded-full flex items-center justify-center transition-colors ${
                  data.interfacingRequired
                    ? "border-gold bg-gold"
                    : "border-charcoal/30"
                }`}
              >
                {data.interfacingRequired && (
                  <div className="w-2 h-2 rounded-full bg-bone" />
                )}
              </div>
              <span className="text-sm text-charcoal">Haircanvas Interfacing</span>
            </label>
          </div>
        </div>

        <div className="border-t border-platinum pt-8">
          <div className="space-y-4">
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
          </div>
        </div>

        <motion.button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="group w-full py-4 bg-charcoal text-bone disabled:opacity-50 flex items-center justify-center gap-3"
        >
          <span className="tracking-[0.15em] text-sm">
            {isSubmitting ? "Submitting..." : "Submit Inquiry to Atelier"}
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </div>
  );
}