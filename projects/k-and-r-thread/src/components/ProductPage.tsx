"use client";

import { motion } from "framer-motion";
import { 
  Scale, 
  Layers, 
  MapPin, 
  Scissors,
  Maximize2, 
  MessageCircle,
  ArrowRight
} from "lucide-react";

interface Fabric {
  id: string;
  name: string;
  sku: string;
  description: string;
  material: string;
  weight: "light" | "medium" | "heavy";
  threadCount: number;
  gsm: number;
  origin: string;
  imageUrl: string;
  pairings: { id: string; name: string; imageUrl: string }[];
}

const mockFabric: Fabric = {
  id: "venetian-velvet",
  name: "Venetian Velvet",
  sku: "VV-2024-IT",
  description: "A sumptuous velvet woven in the tradition of Venetian masters. This exceptional fabric embodies timeless elegance with a contemporary sensibility, perfect for drapery and upholstery alike.",
  material: "100% Silk",
  weight: "heavy",
  threadCount: 380,
  gsm: 420,
  origin: "Italy",
  imageUrl: "/fabrics/venetian-velvet.jpg",
  pairings: [
    { id: "milano-silk", name: "Milano Silk Lining", imageUrl: "/fabrics/milano-silk.jpg" },
    { id: "gold-thread", name: "Oro Gold Thread", imageUrl: "/fabrics/gold-thread.jpg" },
  ],
};

const weightLabels = {
  light: "Light / Sheer",
  medium: "Medium / Drape",
  heavy: "Heavy / Drape",
};

const visualWeightValue = (weight: string) => {
  const values = { light: 25, medium: 50, heavy: 85 };
  return values[weight as keyof typeof values] || 50;
};

export default function ProductPage() {
  const fabric = mockFabric;

  return (
    <div className="min-h-screen bg-bone">
      <section className="grid lg:grid-cols-2 min-h-screen">
        <div className="relative aspect-square lg:aspect-auto lg:min-h-screen bg-platinum">
          <img
            src={fabric.imageUrl}
            alt={fabric.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8 lg:p-16 lg:overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-xl"
          >
            <p className="text-gold text-sm tracking-[0.3em] mb-4">
              {fabric.sku}
            </p>
            
            <h1
              className="font-playfair text-4xl lg:text-5xl text-charcoal mb-6"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              {fabric.name}
            </h1>
            
            <p className="text-charcoal/70 text-lg leading-relaxed mb-8">
              {fabric.description}
            </p>

            <div className="mb-10">
              <h2 className="text-sm tracking-[0.2em] text-charcoal/50 mb-4">
                VISUAL WEIGHT
              </h2>
              <div className="relative">
                <div className="h-1 bg-platinum rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${visualWeightValue(fabric.weight)}%` }}
                    transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-gold-light to-gold rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-3 text-sm text-charcoal/60">
                  <span>Light / Sheer</span>
                  <span>Heavy / Drape</span>
                </div>
                <p className="mt-2 text-gold font-medium">
                  {weightLabels[fabric.weight]}
                </p>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-sm tracking-[0.2em] text-charcoal/50 mb-4">
                TECHNICAL SPECIFICATIONS
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Scissors, label: "Thread Count", value: `${fabric.threadCount} TC` },
                  { icon: Scale, label: "Weight", value: `${fabric.gsm} GSM` },
                  { icon: MapPin, label: "Origin", value: fabric.origin },
                  { icon: Layers, label: "Material", value: fabric.material },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3 p-4 bg-white/50"
                  >
                    <Icon className="w-5 h-5 text-gold" />
                    <div>
                      <p className="text-xs text-charcoal/50 tracking-wider">
                        {label}
                      </p>
                      <p className="text-charcoal font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-sm tracking-[0.2em] text-charcoal/50 mb-4">
                RECOMMENDED PAIRINGS
              </h2>
              <div className="flex gap-4">
                {fabric.pairings.map((pairing) => (
                  <div key={pairing.id} className="group cursor-pointer">
                    <div className="aspect-square w-24 bg-platinum overflow-hidden">
                      <img
                        src={pairing.imageUrl}
                        alt={pairing.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <p className="mt-2 text-xs text-charcoal/70 group-hover:text-charcoal transition-colors">
                      {pairing.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 group relative px-8 py-4 bg-charcoal text-bone overflow-hidden">
                <span className="absolute inset-0 bg-charcoal/90 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative flex items-center justify-center gap-3 tracking-[0.2em] text-sm">
                  Request Private Swatch
                  <Maximize2 className="w-4 h-4" />
                </span>
              </button>
              
              <button className="flex-1 group px-8 py-4 border border-charcoal/30 text-charcoal hover:border-gold hover:text-gold transition-colors duration-500">
                <span className="flex items-center justify-center gap-3 tracking-[0.2em] text-sm">
                  Consult the Concierge
                  <MessageCircle className="w-4 h-4" />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}