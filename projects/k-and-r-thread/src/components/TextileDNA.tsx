"use client";

import { motion } from "framer-motion";
import { Scissors, Ruler, Droplets, Layers, Maximize2 } from "lucide-react";

interface TextileDNAProps {
  fabricId: string;
  name: string;
  composition: string;
  weight: string;
  width: string;
  drape: string;
  bestFor: string[];
  handFeel: string;
}

export default function TextileDNA({
  fabricId,
  name,
  composition,
  weight,
  width,
  drape,
  bestFor,
  handFeel,
}: TextileDNAProps) {
  const specs = [
    { icon: Scissors, label: "FABRIC ID", value: fabricId },
    { icon: Layers, label: "COMPOSITION", value: composition },
    { icon: Droplets, label: "WEIGHT", value: weight },
    { icon: Ruler, label: "WIDTH", value: width },
    { icon: Maximize2, label: "DRAPE", value: drape },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <p className="text-gold text-xs tracking-[0.3em] mb-6">TEXTILE DNA</p>

      <h2
        className="font-playfair text-3xl md:text-4xl text-charcoal mb-8"
        style={{ fontFamily: "var(--font-playfair)" }}
      >
        {name}
      </h2>

      <div className="border border-t border-l border-gold/30">
        <table className="w-full">
          <tbody>
            {specs.map(({ icon: Icon, label, value }, index) => (
              <tr
                key={label}
                className="border-b border-gold/30 last:border-b-0"
              >
                <td className="py-4 px-5 w-1/3 border-r border-gold/30">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-gold" />
                    <span
                      className="text-[10px] tracking-[0.25em] text-charcoal/50"
                      style={{ fontFamily: "Cormorant Garamond, serif" }}
                    >
                      {label}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-5">
                  <span
                    className="text-sm text-charcoal"
                    style={{ fontFamily: "Cormorant Garamond, serif" }}
                  >
                    {value}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8">
        <p className="text-gold text-xs tracking-[0.3em] mb-4">TAILORING NOTES</p>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] tracking-[0.25em] text-charcoal/50 mb-2">
              HAND-FEEL
            </p>
            <p className="text-sm text-charcoal/80">{handFeel}</p>
          </div>

          <div>
            <p className="text-[10px] tracking-[0.25em] text-charcoal/50 mb-2">
              BEST FOR
            </p>
            <div className="flex flex-wrap gap-2">
              {bestFor.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 border border-charcoal/20 text-xs text-charcoal/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}