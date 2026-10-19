"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, User, Sparkles, Sun, ScanBarcode, QrCode } from "lucide-react";
import { getMember, logout } from "@/components/membership";
import MemberBarcode from "@/components/MemberBarcode";
import MemberQR from "@/components/MemberQR";

export default function MemberCardPage() {
  const router = useRouter();
  const member = getMember();
  const cardRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  const [installReady, setInstallReady] = useState(false);
  const [brightMode, setBrightMode] = useState(false);
  const [brightTimeout, setBrightTimeout] = useState<NodeJS.Timeout | null>(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });
    };

    const card = cardRef.current;
    if (card) {
      card.addEventListener("mousemove", handleMouseMove);
      return () => card.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setInstallReady(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    return () => {
      if (brightTimeout) clearTimeout(brightTimeout);
    };
  }, [brightTimeout]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    (deferredPrompt as any).prompt();
    const { outcome } = await (deferredPrompt as any).userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setInstallReady(false);
    }
  };

  const handleBrighten = async () => {
    if (brightMode) return;
    
    setBrightMode(true);
    
    // Try multiple methods for screen brightness
    const screenAny = screen as any;
    
    // Method 1: Android WebView brightness API (some browsers)
    if (screenAny.brightness) {
      try {
        await screenAny.brightness.set(1);
      } catch {}
    }
    
    // Method 2: Try to use Wake Lock to keep screen on + set visual overlay
    if ('wakeLock' in navigator) {
      try {
        await (navigator as any).wakeLock.request('screen');
      } catch {}
    }
    
    // Method 3: Use CSS to create maximum contrast (always works)
    // The brightMode state adds visual styling
    
    const timeout = setTimeout(() => {
      setBrightMode(false);
      if (screenAny.brightness) {
        try {
          screenAny.brightness.set(0.5);
        } catch {}
      }
    }, 15000);
    
    setBrightTimeout(timeout);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-64 h-96 bg-zinc-900 animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!member) {
    if (typeof window !== "undefined") {
      router.push("/welcome");
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6">
      <style jsx>{`
        .holo-effect {
          background: linear-gradient(
            135deg,
            transparent 40%,
            rgba(197, 160, 89, 0.3) 45%,
            rgba(255, 255, 255, 0.4) 50%,
            rgba(197, 160, 89, 0.3) 55%,
            transparent 60%
          );
          background-size: 200% 200%;
        }
        .holo-move {
          background-position: ${mousePos.x}% ${mousePos.y}%;
        }
      `}</style>

      <div className="w-full max-w-sm">
        <div
          ref={cardRef}
          className={`relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
            brightMode ? "ring-4 ring-yellow-400/80 shadow-yellow-400/30" : ""
          }`}
          style={{
            background: brightMode 
              ? "linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%)" 
              : "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)",
          }}
        >
          <div className={`absolute inset-0 holo-effect holo-move pointer-events-none transition-opacity duration-300 ${brightMode ? "opacity-30" : ""}`} />
          
          <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-300 ${
            brightMode ? "from-yellow-400/10 via-yellow-500/5 to-yellow-400/10" : "from-gold/5 via-transparent to-transparent"
          }`} />
          
          <div className={`absolute inset-0 border rounded-2xl transition-all duration-300 ${
            brightMode ? "border-yellow-400/50" : "border-[rgba(197,160,89,0.2)]"
          }`} />
          
          {brightMode && (
            <div className="absolute inset-0 bg-yellow-400/5 animate-pulse rounded-2xl" />
          )}
          
          <div className="relative h-full flex flex-col p-2 sm:p-4">
            <div className="flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2">
              <div className="mb-1">
                <svg viewBox="0 0 180 40" width="140" height="36" className="mx-auto">
                  <defs>
                    <linearGradient id="cardLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d4b06a" />
                      <stop offset="50%" stopColor="#c5a059" />
                      <stop offset="100%" stopColor="#a58648" />
                    </linearGradient>
                  </defs>
                  <text x="90" y="26" textAnchor="middle" fontFamily="Georgia, serif" fontSize="16" fontWeight="bold" letterSpacing="1.5" fill="url(#cardLogoGrad)">SMOKEY DREAMZ</text>
                </svg>
              </div>

              <div className="mb-1">
                <div className={`p-1.5 sm:p-2 rounded-lg transition-all duration-300 bg-white`}>
                  {showQR ? (
                    <MemberQR value={member.membershipId} />
                  ) : (
                    <MemberBarcode value={member.membershipId} bright={brightMode} />
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQR(!showQR)}
                className="flex items-center gap-1 text-zinc-600 text-xs mt-1 hover:text-zinc-400 transition-colors"
              >
                <QrCode className="w-3 h-3" />
                {showQR ? "Show Barcode" : "Show QR Code"}
              </button>

              <div className={`text-center transition-all duration-300`}>
                <div className={`flex items-center justify-center gap-1 mb-0.5 ${
                  brightMode ? "text-yellow-600" : "text-gold/60"
                }`}>
                  <User className="w-3 h-3" />
                  <span className="text-[10px] uppercase tracking-wider">Member</span>
                </div>
                <h2 className={`font-serif text-lg tracking-wide transition-all duration-300 ${
                  brightMode ? "text-black" : "text-white"
                }`}>
                  {member.name}
                </h2>
                <p className={`text-xs mt-0.5 transition-all duration-300 ${
                  brightMode ? "text-zinc-700" : "text-zinc-600"
                }`}>
                  {member.membershipId}
                </p>
              </div>
            </div>

            <div className="text-center pt-2 border-t border-white/5">
              <div className={`flex items-center justify-center gap-1 transition-all duration-300 ${
                brightMode ? "text-yellow-700" : "text-zinc-500"
              }`}>
                <Sparkles className={`w-2.5 h-2.5 ${brightMode ? "text-yellow-600" : "text-gold/40"}`} />
                <span className={`font-serif text-xs italic transition-all duration-300 ${
                  brightMode ? "text-yellow-800" : ""
                }`}>
                  EST. 2026
                </span>
                <Sparkles className={`w-2.5 h-2.5 ${brightMode ? "text-yellow-600" : "text-gold/40"}`} />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleBrighten}
          className={`mt-4 w-full py-3 px-4 font-medium rounded-xl flex items-center justify-center gap-2 transition-all ${
            brightMode 
              ? "bg-yellow-400 text-black" 
              : "bg-white/10 text-zinc-300 hover:bg-white/20"
          }`}
        >
          <Sun className={`w-4 h-4 ${brightMode ? "animate-pulse" : ""}`} />
          {brightMode ? "Bright Mode Active" : "Press to Brighten"}
        </button>

        <div className="mt-3 flex flex-col gap-3">
          {installReady && (
            <button
              onClick={handleInstall}
              className="w-full py-3 px-4 bg-gold text-black font-medium rounded-xl flex items-center justify-center gap-2 transition-all hover:bg-gold-light"
            >
              <Download className="w-4 h-4" />
              Add to Home Screen
            </button>
          )}

          <button
            onClick={async () => {
              await logout();
              router.push("/welcome");
            }}
            className="w-full py-3 px-4 bg-white/5 text-zinc-400 font-medium rounded-xl flex items-center justify-center gap-2 border border-white/10 hover:bg-white/10 hover:text-white transition-all"
          >
            Sign Out
          </button>
        </div>

        <p className="text-center text-zinc-600 text-xs mt-4 flex items-center justify-center gap-2">
          <ScanBarcode className="w-3 h-3" />
          Present barcode to staff for scanning
        </p>
      </div>
    </div>
  );
}