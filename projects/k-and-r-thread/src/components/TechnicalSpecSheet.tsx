"use client";

import { motion } from "framer-motion";
import { Scissors, Ruler, Layers, Maximize2 } from "lucide-react";

interface TechnicalSpecSheetProps {
  articleNo: string;
  fiberContent: string;
  weave: string;
  weight: string;
  width: string;
  application: string[];
  imageUrl: string;
}

export default function TechnicalSpecSheet({
  articleNo,
  fiberContent,
  weave,
  weight,
  width,
  application,
  imageUrl,
}: TechnicalSpecSheetProps) {
  const specs = [
    { label: "ARTICLE NO", value: articleNo, highlight: true },
    { label: "FIBER CONTENT", value: fiberContent },
    { label: "WEAVE", value: weave },
    { label: "WEIGHT", value: weight },
    { label: "WIDTH", value: width },
  ];

  return (
    <section className="w-full py-16 bg-white">
      <div className="max-w-5xl mx-auto px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative aspect-square bg-charcoal/5 overflow-hidden"
          >
            <img
              src={imageUrl}
              alt={`Technical spec: ${articleNo}`}
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-charcoal/40 text-[10px] tracking-[0.3em] mb-6">
              TECHNICAL SPECIFICATION
            </p>

            <div className="border-t border-charcoal/10">
              {specs.map(({ label, value, highlight }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between py-4 border-b border-charcoal/10 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 text-charcoal/30">
                      {label === "FIBER CONTENT" && <Layers className="w-4 h-4" />}
                      {label === "WEAVE" && <Scissors className="w-4 h-4" />}
                      {label === "WEIGHT" && <Ruler className="w-4 h-4" />}
                      {label === "WIDTH" && <Maximize2 className="w-4 h-4" />}
                    </div>
                    <span className="text-[10px] tracking-[0.2em] text-charcoal/40">
                      {label}
                    </span>
                  </div>
                  <span
                    className={`text-sm ${
                      highlight ? "text-gold" : "text-charcoal"
                    }`}
                  >
                    {value}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="mt-8">
              <p className="text-charcoal/40 text-[10px] tracking-[0.2em] mb-3">
                APPLICATION
              </p>
              <div className="flex flex-wrap gap-2">
                {application.map((app) => (
                  <span
                    key={app}
                    className="px-3 py-1 border border-charcoal/20 text-[11px] text-charcoal/60"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}