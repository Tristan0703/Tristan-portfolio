"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ConciergeForm from "./ConciergeForm";
import { X, MessageCircle } from "lucide-react";

interface InquiryTriggerProps {
  fabricId: string;
  fabricName: string;
  fabricImage: string;
}

export default function InquiryTrigger({ fabricId, fabricName, fabricImage }: InquiryTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = useCallback(() => setIsOpen(true), []);
  const handleClose = useCallback(() => setIsOpen(false), []);

  return (
    <>
      <button
        onClick={handleOpen}
        className="group relative w-full py-4 px-8 bg-charcoal text-bone overflow-hidden"
      >
        <motion.span
          className="absolute inset-0 bg-gold"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ transformOrigin: "left" }}
        />
        <span className="relative flex items-center justify-center gap-3 tracking-[0.2em] text-sm">
          <MessageCircle className="w-4 h-4" />
          Begin Consultation
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-charcoal/40 z-50"
              onClick={handleClose}
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-bone z-50 overflow-y-auto"
            >
              <div className="sticky top-0 bg-bone/95 backdrop-blur-sm border-b border-platinum z-10">
                <div className="flex items-center justify-between p-6">
                  <div>
                    <p className="text-gold text-xs tracking-[0.3em]">QUOTE REQUEST</p>
                    <h2
                      className="font-playfair text-2xl text-charcoal mt-1"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {fabricName}
                    </h2>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-platinum/50 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-charcoal" />
                  </button>
                </div>
              </div>

              <ConciergeForm
                fabricId={fabricId}
                fabricName={fabricName}
                fabricImage={fabricImage}
                onClose={handleClose}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}