"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fabrics } from "@/lib/fabrics";
import { Play, Pause, ArrowRight } from "lucide-react";

interface FabricMotionProps {
  title?: string;
  subtitle?: string;
}

export default function FabricMotion({
  title = "The Motion Gallery",
  subtitle = "Fabric character through movement",
}: FabricMotionProps) {
  const [activeCard, setActiveCard] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<Record<string, boolean>>({});

  const displayFabrics = fabrics.slice(0, 4);

  const togglePlay = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlaying((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section id="collection" className="w-full py-24 bg-bone">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold text-xs tracking-[0.3em] mb-4"
          >
            HAND-FEEL STUDIES
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-playfair text-4xl md:text-5xl text-charcoal mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-charcoal/60 tracking-[0.15em] text-sm"
          >
            {subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {displayFabrics.map((fabric, index) => (
            <motion.article
              key={fabric.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => setActiveCard(activeCard === fabric.id ? null : fabric.id)}
              className="group cursor-pointer"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-platinum/30 mb-4">
                <img
                  src={fabric.imageUrl}
                  alt={fabric.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <button
                    onClick={(e) => togglePlay(fabric.id, e)}
                    className="w-12 h-12 bg-charcoal/80 rounded-full flex items-center justify-center text-bone hover:bg-gold hover:text-charcoal transition-colors"
                  >
                    {isPlaying[fabric.id] ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-charcoal/80 to-transparent">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-gold text-[10px] tracking-[0.2em] mb-1">
                        {fabric.material}
                      </p>
                      <h3
                        className="font-playfair text-xl text-bone"
                        style={{ fontFamily: "var(--font-playfair)" }}
                      >
                        {fabric.name}
                      </h3>
                    </div>
                    <p className="text-bone/80 text-sm">{fabric.weight}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-charcoal/50 tracking-[0.15em] mb-2">
                  HAND-FEEL
                </p>
                <p className="text-sm text-charcoal/80 italic">
                  {fabric.handFeel}
                </p>
                <p className="text-xs text-charcoal/50">
                  Composition: {fabric.composition}
                </p>
                <p className="text-xs text-charcoal/50">Weave: {fabric.weave}</p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/fabrics"
            className="inline-flex items-center gap-3 text-charcoal/60 hover:text-charcoal transition-colors text-xs tracking-[0.2em]"
          >
            View All Collections
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}