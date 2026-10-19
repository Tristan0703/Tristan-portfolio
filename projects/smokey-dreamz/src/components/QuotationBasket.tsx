"use client";

import { useState } from "react";
import { ShoppingBag, X, Send, Mail } from "lucide-react";
import { Product } from "./products";

interface QuotationBasketProps {
  items: Product[];
  onRemove: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function QuotationBasket({ items, onRemove, isOpen, onToggle }: QuotationBasketProps) {
  const [showCheckout, setShowCheckout] = useState(false);

  const generateWhatsAppLink = () => {
    const message = items.map(item => 
      `• ${item.name} (${item.category})`
    ).join("\n");
    
    const fullMessage = `*New Quotation Request*\n\n${message}\n\n*Total Items:* ${items.length}`;
    return `https://wa.me/27123456789?text=${encodeURIComponent(fullMessage)}`;
  };

  const generateEmailLink = () => {
    const subject = "New Quotation Request - Smokey Dreamz";
    const body = items.map(item => 
      `${item.name} (${item.category})`
    ).join("\n");
    
    return `mailto:info@smokeydreamz.co.za?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Quotation Request:\n\n${body}\n\nTotal Items: ${items.length}`)}`;
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#2d5a27] hover:bg-[#3d7a37] text-white rounded-full shadow-lg shadow-[#2d5a27]/20 flex items-center justify-center transition-all duration-300 hover:scale-105"
      >
        <ShoppingBag className="w-6 h-6" />
        {items.length > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-[#2d5a27] text-xs font-bold rounded-full flex items-center justify-center">
            {items.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 animate-fade-in">
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={onToggle}
          />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden flex flex-col animate-slide-up">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="font-serif text-lg text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#2d5a27]" />
                Quotation Basket
              </h3>
              <button
                onClick={onToggle}
                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto text-zinc-700 mb-4" />
                  <p className="text-zinc-500">Your basket is empty</p>
                  <p className="text-zinc-600 text-sm mt-1">Add items from the menu</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl"
                    >
                      <div>
                        <p className="text-white font-medium">{item.name}</p>
                        <p className="text-zinc-500 text-xs">{item.category}</p>
                      </div>
                      <button
                        onClick={() => onRemove(item.id)}
                        className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-4 border-t border-zinc-800 space-y-3">
                {!showCheckout ? (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-3 bg-[#2d5a27] hover:bg-[#3d7a37] text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                    Send Quotation
                  </button>
                ) : (
                  <div className="space-y-3 animate-fade-in">
                    <p className="text-zinc-400 text-sm text-center">Choose delivery method:</p>
                    <a
                      href={generateWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      Send via WhatsApp
                    </a>
                    <a
                      href={generateEmailLink()}
                      className="w-full py-3 border border-zinc-700 hover:border-zinc-600 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      Send via Email
                    </a>
                    <button
                      onClick={() => setShowCheckout(false)}
                      className="w-full py-2 text-zinc-500 hover:text-white text-sm transition-colors"
                    >
                      Back
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
