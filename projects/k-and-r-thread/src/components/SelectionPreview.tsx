"use client";

import { motion } from "framer-motion";
import type { FormData } from "@/types/form";

interface SelectionPreviewProps {
  formData: FormData;
  fabricName: string;
  fabricImage: string;
}

const addOnLabels: Record<string, string> = {
  "silk-lining": "Silk Lining",
  "anti-stain": "Anti-Stain Treatment",
  "priority": "Priority Shipping",
  "rush-production": "Rush Production",
};

export default function SelectionPreview({ formData, fabricName, fabricImage }: SelectionPreviewProps) {
  return (
    <div className="hidden lg:block w-80 border-l border-platinum bg-cream/50 p-8">
      <p className="text-xs text-charcoal/50 tracking-[0.3em] mb-6">
        SELECTION SUMMARY
      </p>

      <div className="space-y-6">
        <div className="aspect-square bg-platinum overflow-hidden">
          <img
            src={fabricImage}
            alt={fabricName}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h4
            className="font-playfair text-lg text-charcoal"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {fabricName}
          </h4>
        </div>

        <motion.div
          key={formData.projectType}
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {formData.projectType && (
            <div>
              <p className="text-xs text-charcoal/40 tracking-[0.2em] mb-1">
                PROJECT
              </p>
              <p className="text-sm text-charcoal">{formData.projectType}</p>
            </div>
          )}

          {(formData.yardage || formData.width) && (
            <div>
              <p className="text-xs text-charcoal/40 tracking-[0.2em] mb-1">
                DIMENSIONS
              </p>
              <p className="text-sm text-charcoal">
                {formData.yardage && `${formData.yardage} yards`}
                {formData.yardage && formData.width && " × "}
                {formData.width}
              </p>
            </div>
          )}

          {formData.deadline && (
            <div>
              <p className="text-xs text-charcoal/40 tracking-[0.2em] mb-1">
                DEADLINE
              </p>
              <p className="text-sm text-charcoal">
                {new Date(formData.deadline).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          {formData.addOns.length > 0 && (
            <div>
              <p className="text-xs text-charcoal/40 tracking-[0.2em] mb-2">
                ADD-ONS
              </p>
              <div className="space-y-1">
                {formData.addOns.map((id) => (
                  <p key={id} className="text-sm text-gold">
                    {addOnLabels[id]}
                  </p>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}