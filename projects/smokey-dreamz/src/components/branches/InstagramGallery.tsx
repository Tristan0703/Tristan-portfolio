"use client";

import { ExternalLink } from "lucide-react";
import { Branch } from "./branchData";

interface InstagramGalleryProps {
  branch: Branch;
}

export default function InstagramGallery({ branch }: InstagramGalleryProps) {
  const getFollowText = () => {
    switch (branch.id) {
      case "witbank":
        return "@smokeydreamzwitdank";
      case "randpark":
        return "@smokeydreamz.randpark";
      case "blairgowrie":
        return "@smokeydreamz.blairgowrie420";
      default:
        return "@smokeydreamz";
    }
  };

  return (
    <section className="py-8 px-4 md:px-6">
      <div className="max-w-[600px] mx-auto">
        <div 
          className="relative border border-[rgba(197,160,89,0.5)] rounded-xl overflow-hidden backdrop-blur-md bg-black/40 shadow-lg p-6"
          style={{
            boxShadow: branch.id === 'witbank' 
              ? '0 0 30px rgba(236, 72, 153, 0.3)' 
              : branch.id === 'randpark'
              ? '0 0 30px rgba(34, 197, 94, 0.3)'
              : '0 0 30px rgba(197, 160, 89, 0.3)'
          }}
        >
          <div className="flex items-center justify-center gap-4">
            <svg className="w-8 h-8 text-gold" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <div className="text-center">
              <p className="text-zinc-400 text-sm mb-1">Follow us on Instagram</p>
              <p className="text-gold font-medium text-lg">{getFollowText()}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <a
              href={branch.instagramUrl || "https://instagram.com/smokeydreamz"}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-medium tracking-wide rounded-lg transition-all duration-300"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Instagram Page
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}