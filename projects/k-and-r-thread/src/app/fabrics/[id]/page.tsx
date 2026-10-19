import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fabrics, getFabricById } from "@/lib/fabrics";
import TechnicalSpecSheet from "@/components/TechnicalSpecSheet";
import FabricQuoteWrapper from "@/components/FabricQuoteWrapper";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return fabrics.map((fabric) => ({
    id: fabric.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const fabric = getFabricById(id);
  if (!fabric) return { title: "Not Found" };
  return {
    title: `${fabric.name} | K&R Thread Digital Atelier`,
    description: fabric.description,
  };
}

export default async function FabricDetailPage({ params }: PageProps) {
  const { id } = await params;
  const fabric = getFabricById(id);
  if (!fabric) notFound();

  const relatedFabrics = fabrics
    .filter((f) => f.id !== fabric.id && f.material === fabric.material)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-bone">
      <Link
        href="/fabrics"
        className="fixed top-24 left-8 z-10 inline-flex items-center gap-2 text-charcoal/40 hover:text-charcoal transition-colors text-xs tracking-[0.15em]"
      >
        <ArrowLeft className="w-4 h-4" />
        Collections
      </Link>
      <section className="grid lg:grid-cols-2 min-h-[80vh]">
        <div className="relative aspect-square lg:aspect-auto lg:min-h-screen bg-charcoal/5">
          <img
            src={fabric.imageUrl}
            alt={fabric.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-8 lg:p-16 lg:overflow-y-auto">
          <p className="text-gold text-xs tracking-[0.3em] mb-2">
            {fabric.isVault ? "VAULT EXCLUSIVE" : "SIGNATURE COLLECTION"}
          </p>
          <h1
            className="font-playfair text-4xl lg:text-5xl text-charcoal mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            {fabric.name}
          </h1>
          <p className="text-charcoal/60 text-lg mb-8 max-w-lg">
            {fabric.description}
          </p>

          <div className="mb-8">
            <p className="text-xs text-charcoal/50 tracking-[0.2em] mb-3">
              COMPOSITION
            </p>
            <p className="text-charcoal">{fabric.composition}</p>
          </div>

          <div className="mb-8">
            <p className="text-xs text-charcoal/50 tracking-[0.2em] mb-3">
              HAND-FEEL
            </p>
            <p className="text-charcoal italic">{fabric.handFeel}</p>
          </div>

          <div className="mb-8">
            <p className="text-xs text-charcoal/50 tracking-[0.2em] mb-3">
              BEST FOR
            </p>
            <div className="flex flex-wrap gap-2">
              {fabric.bestFor.map((item) => (
                <span
                  key={item}
                  className="px-3 py-1 border border-charcoal/20 text-xs text-charcoal/70"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs text-charcoal/50 tracking-[0.2em] mb-3">
              TAILORING NOTES
            </p>
            <div className="space-y-2">
              {Object.entries(fabric.garmentYardage).map(([garment, yardage]) => (
                <div
                  key={garment}
                  className="flex justify-between py-2 border-b border-platinum"
                >
                  <span className="text-sm text-charcoal/70 capitalize">
                    {garment.replace(/-/g, " ")}
                  </span>
                  <span className="text-sm text-charcoal font-medium">{yardage}</span>
                </div>
              ))}
            </div>
          </div>

          <FabricQuoteWrapper
            fabricId={fabric.id}
            fabricName={fabric.name}
            composition={fabric.composition}
            weight={fabric.weight}
            swatchImage={fabric.imageUrl}
          />
        </div>
      </section>

      <TechnicalSpecSheet
        articleNo={`KR-${fabric.id.toUpperCase().slice(0, 8)}`}
        fiberContent={fabric.composition}
        weave={fabric.weave}
        weight={fabric.weight}
        width="150cm (Standard)"
        application={fabric.bestFor}
        imageUrl={fabric.imageUrl}
      />

      {relatedFabrics.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-8">
            <p className="text-gold text-xs tracking-[0.3em] mb-4">RELATED FABRICS</p>
            <h2
              className="font-playfair text-2xl text-charcoal mb-8"
              style={{ fontFamily: "var(--font-playfair)" }}
            >
              You may also consider
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedFabrics.map((related) => (
                <Link
                  key={related.id}
                  href={`/fabrics/${related.id}`}
                  className="group"
                >
                  <div className="aspect-square bg-platinum/30 overflow-hidden mb-3">
                    <img
                      src={related.imageUrl}
                      alt={related.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <p className="text-xs text-charcoal/50 tracking-[0.15em] mb-1">
                    {related.material}
                  </p>
                  <h3
                    className="font-playfair text-sm text-charcoal"
                    style={{ fontFamily: "var(--font-playfair)" }}
                  >
                    {related.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}