"use client";

import dynamic from "next/dynamic";

const HeroCanvas = dynamic(
  () => import("./HeroCanvas").then((module) => module.HeroCanvas),
  {
    ssr: false,
    loading: () => <div className="hatch h-full w-full" aria-hidden="true" />,
  },
);

export function HeroVisual() {
  return <HeroCanvas />;
}
