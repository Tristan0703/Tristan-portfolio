"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SelectionPreview from "./SelectionPreview";
import FormSuccess from "./FormSuccess";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { FormData } from "@/types/form";
import { projectTypes, addOnOptions, initialFormData } from "@/types/form";

interface ConciergeFormProps {
  fabricId: string;
  fabricName: string;
  fabricImage: string;
  onClose: () => void;
}

export default function ConciergeForm({
  fabricId,
  fabricName,
  fabricImage,
  onClose,
}: ConciergeFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState("");

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  const updateField = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAddOn = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      addOns: prev.addOns.includes(id)
        ? prev.addOns.filter((a) => a !== id)
        : [...prev.addOns, id],
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, fabricId }),
      });
      const data = await res.json();
      setReferenceNumber(data.referenceNumber);
      setIsSuccess(true);
    } catch {
      console.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.projectType !== "";
      case 2:
        return formData.yardage !== "" && formData.width !== "";
      case 3:
        return true;
      case 4:
        return formData.name !== "" && formData.email !== "";
      default:
        return false;
    }
  };

  if (isSuccess) {
    return (
      <FormSuccess
        referenceNumber={referenceNumber}
        fabricName={fabricName}
        fabricId={fabricId}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)]">
      <div className="flex-1 p-8">
        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <div className="h-[2px] bg-platinum overflow-hidden">
              <motion.div
                className="h-full bg-gold"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <p className="mt-4 text-xs text-charcoal/50 tracking-[0.2em]">
              STEP {currentStep} OF {totalSteps}
            </p>
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3
                    className="font-playfair text-2xl text-charcoal mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Project Vision
                  </h3>
                  <p className="text-sm text-charcoal/60">
                    Tell us about your creative direction
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
                    PROJECT TYPE
                  </label>
                  <select
                    value={formData.projectType}
                    onChange={(e) => updateField("projectType", e.target.value)}
                    className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none text-charcoal transition-colors"
                  >
                    <option value="">Select project type</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
                    PROJECT DEADLINE
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => updateField("deadline", e.target.value)}
                    className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none text-charcoal transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3
                    className="font-playfair text-2xl text-charcoal mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Dimensions
                  </h3>
                  <p className="text-sm text-charcoal/60">
                    Help us calculate material requirements
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
                    ESTIMATED YARDAGE
                  </label>
                  <input
                    type="number"
                    value={formData.yardage}
                    onChange={(e) => updateField("yardage", e.target.value)}
                    placeholder="e.g., 5"
                    className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none text-charcoal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
                    WIDTH REQUIREMENT
                  </label>
                  <input
                    type="text"
                    value={formData.width}
                    onChange={(e) => updateField("width", e.target.value)}
                    placeholder="e.g., 54 inches"
                    className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none text-charcoal transition-colors"
                  />
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3
                    className="font-playfair text-2xl text-charcoal mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Finishing Touches
                  </h3>
                  <p className="text-sm text-charcoal/60">
                    Elevate your project with premium options
                  </p>
                </div>

                <div className="space-y-4">
                  {addOnOptions.map(({ id, label }) => (
                    <label
                      key={id}
                      className="flex items-center gap-4 cursor-pointer group"
                    >
                      <div
                        className={`w-5 h-5 border rounded-full flex items-center justify-center transition-colors ${
                          formData.addOns.includes(id)
                            ? "border-gold bg-gold"
                            : "border-charcoal/30"
                        }`}
                        onClick={() => toggleAddOn(id)}
                      >
                        {formData.addOns.includes(id) && (
                          <div className="w-2 h-2 rounded-full bg-bone" />
                        )}
                      </div>
                      <span
                        className="text-charcoal group-hover:text-gold transition-colors"
                        onClick={() => toggleAddOn(id)}
                      >
                        {label}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3
                    className="font-playfair text-2xl text-charcoal mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    Contact
                  </h3>
                  <p className="text-sm text-charcoal/60">
                    How shall we reach you?
                  </p>
                </div>

                <div>
                  <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
                    NAME *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none text-charcoal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
                    COMPANY (OPTIONAL)
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => updateField("company", e.target.value)}
                    className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none text-charcoal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
                    EMAIL *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none text-charcoal transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-charcoal/50 tracking-[0.2em] mb-2">
                    PROJECT NOTES
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    rows={4}
                    placeholder="Share any specific requirements or inspiration..."
                    className="w-full py-3 bg-transparent border-b border-charcoal/20 focus:border-gold outline-none text-charcoal transition-colors resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-4 mt-12">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-sm text-charcoal/60 hover:text-charcoal transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <div className="flex-1" />
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!isStepValid()}
                className="group flex items-center gap-3 px-6 py-3 bg-charcoal text-bone disabled:opacity-50"
              >
                Continue
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="group flex items-center gap-3 px-6 py-3 bg-gold text-charcoal disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Inquiry"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <SelectionPreview formData={formData} fabricName={fabricName} fabricImage={fabricImage} />
    </div>
  );
}