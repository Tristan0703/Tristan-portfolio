"use client";

import { motion } from "framer-motion";
import { Shield, Sparkles, Crown, ArrowRight } from "lucide-react";
import Link from "next/link";

const benefits = [
  {
    icon: Crown,
    title: "Exclusive Access",
    description: "Limited edition fabrics available only to our distinguished members",
  },
  {
    icon: Sparkles,
    title: "Private Viewings",
    description: "Be the first to experience our seasonal collections before public release",
  },
  {
    icon: Shield,
    title: "Dedicated Concierge",
    description: "Personal consultations with our master textile artisans",
  },
];

export default function ApplyForAccessPage() {
  return (
    <div className="min-h-screen bg-bone flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl text-center"
      >
        <p className="text-gold tracking-[0.3em] text-sm mb-4">
          PRIVATE COLLECTION
        </p>

        <h1
          className="font-playfair text-4xl md:text-5xl text-charcoal mb-6"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          The Exclusive Vault
        </h1>

        <p className="text-charcoal/70 text-lg leading-relaxed mb-12">
          Certain treasures in our collection are reserved for members of the K&R Thread
          Concierge Program. Our Vault items represent the pinnacle of textile artistry.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {benefits.map(({ icon: Icon, title, description }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-6 bg-white/50"
            >
              <Icon className="w-8 h-8 text-gold mx-auto mb-4" />
              <h3
                className="font-playfair text-lg text-charcoal mb-2"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                {title}
              </h3>
              <p className="text-sm text-charcoal/60">{description}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="group px-8 py-4 bg-charcoal text-bone">
            <span className="flex items-center justify-center gap-3 tracking-[0.2em] text-sm">
              Apply for Designer Access
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>

          <Link
            href="/"
            className="px-8 py-4 border border-charcoal/30 text-charcoal hover:border-gold hover:text-gold transition-colors duration-500"
          >
            <span className="flex items-center justify-center gap-3 tracking-[0.2em] text-sm">
              Return to Atelier
            </span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}