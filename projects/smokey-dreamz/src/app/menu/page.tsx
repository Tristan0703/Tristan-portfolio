"use client";

import { useState, useEffect } from "react";
import { Filter, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";
import StrainSpotlight from "@/components/StrainSpotlight";
import QuotationDrawer from "@/components/QuotationDrawer";
import Footer from "@/components/Footer";
import { Product, ProductCategory, isNewDrop, formatCategoryForFilter } from "@/components/products";
import { getMember } from "@/components/membership";
import { branches } from "@/components/branches/branchData";

const categories: ProductCategory[] = ["All", "Boutique", "Premium", "Edibles"];

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quoteItems, setQuoteItems] = useState<Product[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const member = getMember();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();

        if (response.ok) {
          setProducts(data || []);
        } else {
          console.error("Fetch error:", data);
        }
      } catch (err) {
        console.error("Error fetching products:", err);
      }
      setLoading(false);
    };

    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === "All"
    ? products
    : products.filter((p) => p.category === selectedCategory);

  const handleAddToQuote = (product: Product) => {
    if (!quoteItems.find((item) => item.id === product.id)) {
      setQuoteItems([...quoteItems, product]);
    }
  };

  const handleRemoveFromQuote = (id: string) => {
    setQuoteItems(quoteItems.filter((item) => item.id !== id));
  };

  const isInQuote = (productId: string) => {
    return quoteItems.some((item) => item.id === productId);
  };

  const generateWhatsAppMessage = () => {
    const itemsList = quoteItems
      .map((item) => `• ${item.name} (${item.category})`)
      .join("\n");

    let message = "Hi Smokey Dreamz, I'd like a quote on the following items:";

    if (member) {
      message = `Hi Smokey Dreamz, I am Member ${member.membershipId}. I'd like a quote on the following items from the ${branches.randpark.name} menu:\n\n`;
    }

    message += `\n\n${itemsList}\n\n━━━━━━━━━━━━━━━\nTotal Items: ${quoteItems.length}`;

    return `https://wa.me/27123456789?text=${encodeURIComponent(message)}`;
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-surface border border-white/5 rounded-xl overflow-hidden">
          <div className="aspect-[4/3] bg-zinc-800 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="h-5 bg-zinc-800 animate-pulse rounded w-3/4" />
            <div className="h-4 bg-zinc-800 animate-pulse rounded w-1/2" />
            <div className="h-10 bg-zinc-800 animate-pulse rounded w-full mt-4" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="py-16 lg:py-24 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12 lg:mb-16">
              <span className="text-xs font-medium tracking-widest uppercase text-gold mb-4 block">
                Premium Selection
              </span>
              <h1 className="font-serif text-4xl lg:text-5xl text-white mb-4">The Menu</h1>
              <p className="text-zinc-500 max-w-xl mx-auto leading-relaxed">
                Discover our curated collection. Available for quotation - prices upon inquiry.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 lg:gap-3 mb-12 lg:mb-16 flex-wrap">
              <Filter className="w-4 h-4 text-gold/60 mr-1" />
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 lg:px-6 py-2 text-xs lg:text-sm font-medium rounded-full transition-all duration-300 ${
                    selectedCategory === category
                      ? "bg-gold text-background"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/10"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {loading ? (
              renderSkeleton()
            ) : (
              <>
                {selectedCategory === "All" ? (
                  <div className="space-y-16 lg:space-y-20">
                    {["Boutique", "Premium", "Edibles"].map((cat) => {
                      const catProducts = products.filter((p) => p.category === cat);
                      if (catProducts.length === 0) return null;
                      return (
                        <section key={cat}>
                          <div className="mb-8">
                            <h2 className="font-serif text-2xl lg:text-3xl text-white mb-2">
                              {cat} Flower
                            </h2>
                            <p className="text-zinc-500 text-sm">
                              {cat === "Boutique"
                                ? "Premium strains - 5G tiers"
                                : cat === "Premium"
                                ? "Exceptional value - 2G & 1G tiers"
                                : "Edibles & infusions"}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {catProducts.map((product, index) => (
                              <div
                                key={product.id}
                                className="animate-fade-in opacity-0"
                                style={{
                                  animationDelay: `${index * 50}ms`,
                                  animationFillMode: "forwards",
                                }}
                              >
                                <ProductCard
                                  product={product}
                                  onViewDetails={setSelectedProduct}
                                  onRequestQuote={handleAddToQuote}
                                  isInQuote={isInQuote(product.id)}
                                  isNew={isNewDrop(product.created_at)}
                                />
                              </div>
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="animate-fade-in opacity-0"
                        style={{
                          animationDelay: `${index * 50}ms`,
                          animationFillMode: "forwards",
                        }}
                      >
                        <ProductCard
                          product={product}
                          onViewDetails={setSelectedProduct}
                          onRequestQuote={handleAddToQuote}
                          isInQuote={isInQuote(product.id)}
                          isNew={isNewDrop(product.created_at)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {filteredProducts.length === 0 && !loading && (
              <div className="text-center py-24">
                <p className="text-zinc-600 font-serif text-xl">No products found</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />

      <StrainSpotlight
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToQuote={handleAddToQuote}
        isInQuote={selectedProduct ? isInQuote(selectedProduct.id) : false}
      />

      <QuotationDrawer
        items={quoteItems}
        onRemove={handleRemoveFromQuote}
        isOpen={drawerOpen}
        onToggle={() => setDrawerOpen(!drawerOpen)}
      />
    </div>
  );
}