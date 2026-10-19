"use client";

import { useState } from "react";
import { Quote, Info } from "lucide-react";
import { Product } from "./products";
import { getStrainProfile } from "./strainData";
import { getPlaceholderImage } from "./products";
import StrainHoverCard from "./StrainHoverCard";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onRequestQuote: (product: Product) => void;
  isInQuote: boolean;
  isNew?: boolean;
}

export default function ProductCard({ product, onViewDetails, onRequestQuote, isInQuote, isNew }: ProductCardProps) {
  const [showStrainCard, setShowStrainCard] = useState(false);
  const strainProfile = getStrainProfile(product.name);

  const handleStrainClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (strainProfile) {
      setShowStrainCard(true);
    } else {
      onViewDetails(product);
    }
  };

  return (
    <>
      <article className="group relative bg-surface border border-[rgba(197,160,89,0.15)] rounded-xl overflow-hidden hover:border-[rgba(197,160,89,0.3)] transition-all duration-500 flex flex-col backdrop-blur-sm">
        {isNew && (
          <div className="absolute top-3 right-3 z-10 px-3 py-1 bg-[#c5a059] text-black text-[10px] font-bold tracking-widest uppercase rounded-full">
            NEW DROP
          </div>
        )}
        
        <div className="p-6 pb-0">
          <div 
            className="aspect-square bg-gradient-to-br from-zinc-800/30 to-zinc-900/50 rounded-xl flex items-center justify-center relative overflow-hidden cursor-pointer"
            onClick={handleStrainClick}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.name}
                className="w-full h-full object-cover absolute inset-0"
              />
            ) : (
              <img 
                src={getPlaceholderImage(product.name, product.category)}
                alt={product.name}
                className="w-full h-full object-cover absolute inset-0"
              />
            )}
            
            {strainProfile && (
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center">
                <span className="px-3 py-1.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-full text-xs text-gold font-medium flex items-center gap-1.5">
                  <Info className="w-3 h-3" />
                  View Strain Profile
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 pt-4 flex-1 flex flex-col border-l-4 border-[rgba(197,160,89,0.3)] bg-gradient-to-r from-transparent via-[rgba(197,160,89,0.02)] to-transparent">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-serif text-lg text-white group-hover:text-gold transition-colors duration-300">
                  {product.name}
                </h3>
                <span className="inline-block mt-1 text-xs font-medium tracking-wider uppercase text-zinc-500">
                  {product.category}
                </span>
              </div>
            </div>

            <p className="text-zinc-500 text-sm leading-relaxed mb-4 line-clamp-2">
              {product.description || "Premium quality cannabis product."}
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-[rgba(197,160,89,0.1)]">
            <p className="text-xs text-zinc-600 mb-3 text-center">Inquire for Pricing</p>
            <div className="flex gap-2">
              {strainProfile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowStrainCard(true);
                  }}
                  className="flex-1 py-3 px-3 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 bg-transparent border border-[rgba(197,160,89,0.2)] hover:border-gold/30 text-zinc-400 hover:text-gold transition-all duration-300"
                >
                  <Info className="w-4 h-4" />
                  Details
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestQuote(product);
                }}
                className={`flex-1 py-3 px-4 rounded-xl font-medium tracking-wide flex items-center justify-center gap-2 transition-all duration-300 ${
                  isInQuote
                    ? "bg-gold/20 border border-gold/30 text-gold"
                    : "bg-transparent border border-[rgba(197,160,89,0.3)] hover:border-gold hover:bg-gold/10 text-gold"
                }`}
              >
                <Quote className="w-4 h-4" />
                {isInQuote ? "In Selection" : "Quote"}
              </button>
            </div>
          </div>
        </div>
      </article>

      <StrainHoverCard 
        strainName={product.name} 
        isOpen={showStrainCard} 
        onClose={() => setShowStrainCard(false)} 
      />
    </>
  );
}
