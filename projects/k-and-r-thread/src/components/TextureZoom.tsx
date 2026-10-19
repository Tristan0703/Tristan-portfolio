"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TextureZoomProps {
  src: string;
  alt: string;
  zoomLevel?: number;
}

export default function TextureZoom({ 
  src, 
  alt, 
  zoomLevel = 2.5 
}: TextureZoomProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setPosition({ x, y });
  }, []);

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-square overflow-hidden cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
      
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute pointer-events-none border-4 border-gold shadow-2xl overflow-hidden"
            style={{
              width: `${100 / zoomLevel}%`,
              height: `${100 / zoomLevel}%`,
              left: `${position.x}%`,
              top: `${position.y}%`,
              transform: `translate(-50%, -50%)`,
              backgroundImage: `url(${src})`,
              backgroundSize: `${zoomLevel * 100}%`,
              backgroundPosition: `${position.x}% ${position.y}%`,
            }}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at ${position.x}% ${position.y}%, transparent 30%, rgba(212,175,55,0.1) 50%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}