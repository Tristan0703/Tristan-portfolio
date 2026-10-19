"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { fabrics } from "@/lib/fabrics";

interface FabricVaultProps {
  featuredIds?: string[];
  title?: string;
  subtitle?: string;
}

export default function FabricVault({
  featuredIds,
  title = "Fabric Vault",
  subtitle = "The digital home for the world's finest apparel textiles",
}: FabricVaultProps) {
  const [hoveredFabric, setHoveredFabric] = useState<string | null>(null);

  const displayFabrics = featuredIds
    ? fabrics.filter((f) => featuredIds.includes(f.id))
    : fabrics.slice(0, 8);

  return (
    <section id="collection" className="w-full py-24 bg-bone">
      <div className="max-w-7xl mx-auto px-8">
        <div className="text-center mb-16">
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-gold text-xs tracking-[0.3em] mb-4"
          >
            THE DIGITAL ATELIER
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayFabrics.map((fabric, index) => (
            <motion.article
              key={fabric.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredFabric(fabric.id)}
              onMouseLeave={() => setHoveredFabric(null)}
              className="group relative aspect-square overflow-hidden cursor-pointer"
            >
              <img
                src={fabric.imageUrl}
                alt={fabric.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: hoveredFabric === fabric.id ? 1 : 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="absolute inset-0 bg-charcoal/85" />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <p className="text-gold text-[10px] tracking-[0.3em] mb-1">
                    {fabric.isVault ? "VAULT EXCLUSIVE" : "SIGNATURE"}
                  </p>
                  <h3
                    className="font-playfair text-lg text-bone mb-2"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {fabric.name}
                  </h3>
                  <p className="text-xs text-bone/70 mb-1">{fabric.composition}</p>
                  <p className="text-xs text-bone/50 mb-3">{fabric.weight}</p>
                    <Link
                      href={`/fabrics/${fabric.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-bone/30 text-bone hover:bg-bone hover:text-charcoal transition-colors duration-500"
                    >
                      <span className="text-[10px] tracking-[0.15em]">
                        View Specs
                      </span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
              </motion.div>

              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-charcoal/90 to-transparent">
                <p className="text-[10px] text-bone/60 tracking-[0.2em] mb-0.5">
                  {fabric.material}
                </p>
                <h3
                  className="font-playfair text-sm text-bone"
                  style={{ fontFamily: "var(--font-playfair)" }}
                >
                  {fabric.name}
                </h3>
                <p className="text-[10px] text-bone/50 mt-1">{fabric.weight}</p>
              </div>

              {fabric.isVault && (
                <div className="absolute top-3 right-3 px-2 py-1 bg-gold/90">
                  <span className="text-[10px] text-charcoal tracking-[0.1em] font-medium">
                    VAULT
                  </span>
                </div>
              )}
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