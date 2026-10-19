"use client";

import { useState, useEffect } from "react";
import { X, Send, Mail, MessageCircle, Quote, Trash2 } from "lucide-react";
import { Product } from "./products";
import { getMember, Member } from "./membership";
import { branches } from "./branches/branchData";

interface QuotationDrawerProps {
  items: Product[];
  onRemove: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function QuotationDrawer({ items, onRemove, isOpen, onToggle }: QuotationDrawerProps) {
  const [showCheckout, setShowCheckout] = useState(false);
  const [member, setMember] = useState<Member | null>(null);

  useEffect(() => {
    setMember(getMember());
  }, [isOpen]);

  const generateWhatsAppLink = () => {
    const itemsList = items.map(item => 
      `• ${item.name} (${item.category})`
    ).join("\n");

    let header = "*New Quotation Request - Smokey Dreamz*";
    
    if (member) {
      header = `*Hi Smokey Dreamz!*\nThis is ${member.name} (Member: ${member.membershipId}). I'd like a quote on the following items from the ${branches.randpark.name} menu:\n\n`;
    }

    const fullMessage = `${header}${itemsList}\n\n━━━━━━━━━━━━━━━\n*Total Items:* ${items.length}`;
    return `https://wa.me/27123456789?text=${encodeURIComponent(fullMessage)}`;
  };

  const generateEmailLink = () => {
    let header = "Quotation Request - Smokey Dreamz";
    let greeting = "";
    
    if (member) {
      header = `${member.name} - Member: ${member.membershipId}`;
      greeting = `Hi Smokey Dreamz, I'd like a quote on:\n\n`;
    }

    const itemsList = items.map(item => 
      `• ${item.name} (${item.category})`
    ).join("\n\n");

    const subject = `Quotation Request - Smokey Dreamz`;
    const body = `${greeting}${itemsList}\n\n━━━━━━━━━━━━━━━\nTotal Items: ${items.length}`;

    return `mailto:info@smokeydreamz.co.za?subject=${encodeURIComponent(header)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed bottom-8 right-8 z-40 w-16 h-16 bg-accent hover:bg-accent-light border border-gold/30 text-white rounded-full shadow-xl shadow-accent/20 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl group"
        aria-label="Open selection"
      >
        <Quote className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 w-7 h-7 bg-gold text-background text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={onToggle}
          />
          <aside className="relative w-full max-w-md h-full bg-surface border-l border-[rgba(197,160,89,0.2)] flex flex-col animate-slide-in-right">
            <header className="sticky top-0 z-10 bg-surface/95 backdrop-blur-md border-b border-[rgba(197,160,89,0.1)] px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gold/10 border border-gold/20 rounded-lg flex items-center justify-center">
                    <Quote className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <h2 className="font-serif text-xl text-white">Your Selection</h2>
                    <p className="text-xs text-zinc-500">{items.length} items selected</p>
                  </div>
                </div>
                <button
                  onClick={onToggle}
                  className="p-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                    <Quote className="w-10 h-10 text-zinc-700" />
                  </div>
                  <h3 className="font-serif text-xl text-white mb-2">No selections yet</h3>
                  <p className="text-zinc-500 text-sm max-w-xs">
                    Browse our curated menu and add strains to your quotation
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      className="group p-5 bg-white/5 border border-white/10 rounded-xl hover:border-[rgba(197,160,89,0.3)] transition-all duration-300"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h4 className="font-serif text-lg text-white">{item.name}</h4>
                          </div>
                          <p className="text-zinc-500 text-sm mb-3">{item.category}</p>
                        </div>
                        <button
                          onClick={() => onRemove(item.id)}
                          className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <footer className="sticky bottom-0 bg-surface/95 backdrop-blur-md border-t border-[rgba(197,160,89,0.1)] p-8 space-y-3">
                {!showCheckout ? (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-4 px-6 bg-gold hover:bg-gold-light text-background font-medium tracking-wide rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
                  >
                    <Send className="w-5 h-5" />
                    Send Quotation
                  </button>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    {member && (
                      <div className="p-3 bg-gold/10 border border-gold/20 rounded-xl text-center">
                        <p className="text-gold text-xs">
                          Sending as: <span className="font-medium">{member.name}</span>
                        </p>
                        <p className="text-gold/70 text-xs">
                          Member ID: {member.membershipId}
                        </p>
                      </div>
                    )}
                    <p className="text-center text-sm text-zinc-500 mb-2">Choose delivery method</p>
                    <a
                      href={generateWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-4 px-6 bg-green-600 hover:bg-green-500 text-white font-medium tracking-wide rounded-xl flex items-center justify-center gap-3 transition-all duration-300"
                    >
                      <MessageCircle className="w-5 h-5" />
                      WhatsApp
                    </a>
                    <a
                      href={generateEmailLink()}
                      className="w-full py-4 px-6 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium tracking-wide rounded-xl flex items-center justify-center gap-3 transition-all duration-300"
                    >
                      <Mail className="w-5 h-5" />
                      Email
                    </a>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="w-full py-2 text-zinc-500 hover:text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                  </div>
                )}
              </footer>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
