"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search, Filter, ArrowLeft } from "lucide-react";
import { fabrics } from "@/lib/fabrics";
import TactileHeader from "@/components/TactileHeader";

export default function FabricsPage() {
  const [hoveredFabric, setHoveredFabric] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("all");

  const materials = ["all", ...new Set(fabrics.map((f) => f.material))];

  const filteredFabrics = fabrics.filter((fabric) => {
    const matchesSearch =
      searchQuery === "" ||
      fabric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fabric.material.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fabric.composition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMaterial =
      selectedMaterial === "all" || fabric.material === selectedMaterial;
    return matchesSearch && matchesMaterial;
  });

  return (
    <main className="min-h-screen bg-bone">
      <TactileHeader />
      
      <section className="pt-32 pb-16 px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-charcoal/40 hover:text-charcoal transition-colors text-xs tracking-[0.15em] mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Atelier
            </Link>
            <p className="text-gold text-xs tracking-[0.3em] mb-4">THE DIGITAL ATELIER</p>
            <h1
              className="font-playfair text-5xl md:text-6xl text-charcoal mb-4"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              Fabric Collections
            </h1>
            <p className="text-charcoal/60 tracking-[0.15em] text-sm max-w-xl mx-auto">
              Explore our curated selection of the world&apos;s finest textiles, from Italian velvets to Scottish cashmeres
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col md:flex-row gap-4 justify-center items-center mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/40" />
              <input
                type="text"
                placeholder="Search fabrics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-3 bg-transparent border border-charcoal/20 focus:border-gold outline-none transition-colors text-charcoal w-64"
              />
            </div>
            
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {materials.map((material) => (
                <button
                  key={material}
                  onClick={() => setSelectedMaterial(material)}
                  className={`px-4 py-2 text-xs tracking-[0.15em] transition-colors ${
                    selectedMaterial === material
                      ? "bg-charcoal text-bone"
                      : "text-charcoal/60 hover:text-charcoal border border-charcoal/20 hover:border-charcoal"
                  }`}
                >
                  {material === "all" ? "ALL" : material.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>

          <p className="text-center text-charcoal/40 text-xs tracking-[0.2em] mb-8">
            {filteredFabrics.length} FABRICS
          </p>
        </div>
      </section>

      <section className="pb-24 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFabrics.map((fabric, index) => (
              <motion.article
                key={fabric.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.5 }}
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

          {filteredFabrics.length === 0 && (
            <div className="text-center py-16">
              <p className="text-charcoal/40 text-sm tracking-[0.15em]">
                No fabrics match your search
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
