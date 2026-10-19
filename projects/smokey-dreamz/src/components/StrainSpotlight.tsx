"use client";

import { useState } from "react";
import { X, Quote, Info } from "lucide-react";
import { Product } from "./products";
import { getStrainProfile, getTypeColor } from "./strainData";
import StrainHoverCard from "./StrainHoverCard";

interface StrainSpotlightProps {
  product: Product | null;
  onClose: () => void;
  onAddToQuote: (product: Product) => void;
  isInQuote: boolean;
}

export default function StrainSpotlight({ product, onClose, onAddToQuote, isInQuote }: StrainSpotlightProps) {
  const [isClosing, setIsClosing] = useState(false);
  const [showStrainCard, setShowStrainCard] = useState(false);
  
  const strainProfile = product ? getStrainProfile(product.name) : null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  if (!product) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={handleClose}
      />
      <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 pointer-events-none ${isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"} transition-all duration-300`}>
        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border border-[rgba(197,160,89,0.3)] rounded-2xl shadow-2xl pointer-events-auto">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className="px-4 py-1 bg-gold/10 border border-gold/30 text-gold text-xs font-medium tracking-wider uppercase rounded-full">
                {product.category}
              </span>
              {strainProfile && (
                <span className={`px-3 py-1 text-xs font-medium tracking-wider uppercase rounded-full border ${getTypeColor(strainProfile.type)}`}>
                  {strainProfile.type}
                </span>
              )}
            </div>

            <h2 className="font-serif text-3xl lg:text-4xl text-white mb-4">{product.name}</h2>

            {strainProfile ? (
              <div className="mb-6 space-y-4">
                <div>
                  <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase mb-1">Lineage</p>
                  <p className="text-zinc-300 text-sm">{strainProfile.lineage}</p>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase mb-1">Terpenes</p>
                  <div className="flex flex-wrap gap-2">
                    {strainProfile.terpenes.map((terpene, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-zinc-400">
                        {terpene}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase mb-1">Effects</p>
                  <div className="flex flex-wrap gap-2">
                    {strainProfile.effects.map((effect, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-[rgba(197,160,89,0.1)] border border-[rgba(197,160,89,0.2)] rounded text-gold">
                        {effect}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-zinc-500 text-xs font-bold tracking-[0.2em] uppercase mb-1">Flavor</p>
                  <div className="flex flex-wrap gap-2">
                    {strainProfile.flavor.map((flavor, i) => (
                      <span key={i} className="px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-zinc-500">
                        {flavor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-zinc-400 text-lg leading-relaxed mb-6">
                {product.description || "A premium quality product from Smokey Dreamz."}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-background/50 rounded-xl border border-white/5">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Category</p>
                <p className="text-white font-medium">{product.category}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-xl border border-white/5">
                <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">Status</p>
                <p className={`font-medium ${product.is_available ? "text-green-400" : "text-red-400"}`}>
                  {product.is_available ? "Available" : "Out of Stock"}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {strainProfile && (
                <button
                  onClick={() => setShowStrainCard(true)}
                  className="flex-1 py-3 px-4 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 bg-transparent border border-[rgba(197,160,89,0.2)] hover:border-gold/30 text-gold transition-all duration-300"
                >
                  <Info className="w-4 h-4" />
                  View Full Profile
                </button>
              )}
              <button
                onClick={() => {
                  onAddToQuote(product);
                  handleClose();
                }}
                disabled={isInQuote || !product.is_available}
                className={`flex-[2] py-3 px-6 rounded-xl font-medium tracking-wide flex items-center justify-center gap-3 transition-all duration-300 ${
                  isInQuote || !product.is_available
                    ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    : "bg-gold hover:bg-gold-light text-background"
                }`}
              >
                <Quote className="w-5 h-5" />
                {isInQuote ? "Already in Selection" : !product.is_available ? "Out of Stock" : "Add to Selection"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {product && (
        <StrainHoverCard
          strainName={product.name}
          isOpen={showStrainCard}
          onClose={() => setShowStrainCard(false)}
        />
      )}
    </>
  );
}