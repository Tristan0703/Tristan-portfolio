"use client";

import { arsenal, arsenalTicker } from "@/data/arsenal";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Tag } from "@/components/ui/Tag";
import { ArsenalTicker } from "./ArsenalTicker";
import { motion } from "framer-motion";

export function Arsenal() {
  return (
    <section id="arsenal" className="border-b border-line py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1220px] px-6">
        <SectionHeader
          index="01"
          title="Technical Arsenal"
          description="The toolset behind the architecture — languages, data layers, engines, and the local-first environment used to ship."
          id="arsenal-title"
        />

        <div className="mt-10">
          <ArsenalTicker />
        </div>

        <div className="mt-12 divide-y divide-line border-b border-line">
          {arsenal.map((group, index) => (
            <Reveal key={group.id} delay={index * 0.05}>
              <motion.div
                className="group grid grid-cols-1 gap-5 py-8 md:grid-cols-12 md:gap-8"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-baseline gap-4 md:col-span-4">
                  <span className="label text-accent">{group.index}</span>
                  <h3 className="font-display text-xl tracking-tight text-bone transition-colors group-hover:text-accent">
                    {group.category}
                  </h3>
                </div>
                <ul className="flex flex-wrap gap-2 md:col-span-8">
                  {group.items.map((item, itemIndex) => (
                    <motion.li
                      key={item}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: itemIndex * 0.02 + index * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <Tag className="transition-all group-hover:border-accent/50 group-hover:text-accent group-hover:shadow-[0_0_12px_rgba(77,216,230,0.2)]">
                        {item}
                      </Tag>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <p className="label mt-6 text-muted">
          {arsenalTicker.length} technologies tracked across {arsenal.length} disciplines
        </p>
      </div>
    </section>
  );
}
