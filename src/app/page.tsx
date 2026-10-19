import { Hero } from "@/components/hero/Hero";
import { Arsenal } from "@/components/arsenal/Arsenal";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { Contact } from "@/components/contact/Contact";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Arsenal />
      <ProjectGrid />
      <Contact />
    </>
  );
}
