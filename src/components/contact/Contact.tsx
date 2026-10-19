import { ArrowUpRight, Mail } from "lucide-react";
import { profile } from "@/data/profile";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ContactForm } from "./ContactForm";

export function Contact() {
  return (
    <section id="contact" className="py-20 lg:py-28">
      <div className="mx-auto w-full max-w-[1220px] px-6">
        <SectionHeader
          index="03"
          title="Contact"
          description="Send the systems involved, the constraints, and the outcome you need. I reply with a technical response, not a sales deck."
        />

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-5">
            <p className="label text-accent">Direct line</p>
            <a
              href={`mailto:${profile.email}`}
              className="mt-5 flex items-center gap-3 font-display text-xl tracking-tight text-bone transition-colors hover:text-accent sm:text-2xl"
            >
              <Mail aria-hidden="true" className="h-5 w-5 text-accent" />
              {profile.email}
            </a>

            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 flex items-center gap-3 font-display text-xl tracking-tight text-bone transition-colors hover:text-accent sm:text-2xl"
            >
              <GithubIcon className="h-5 w-5 text-accent" />
              github.com/Tristan0703
              <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-muted" />
            </a>

            <dl className="mt-12 space-y-6 border-t border-line pt-8">
              <div>
                <dt className="label text-muted">Availability</dt>
                <dd className="mt-2 text-sm text-bone">{profile.availability}</dd>
              </div>
              <div>
                <dt className="label text-muted">Engagements</dt>
                <dd className="mt-2 text-sm text-bone">
                  Technical direction, full-stack builds, 3D and VR systems.
                </dd>
              </div>
              <div>
                <dt className="label text-muted">Source</dt>
                <dd className="mt-2 text-sm text-bone">
                  <a
                    href={profile.repository}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent"
                  >
                    Project sources and site build
                  </a>
                </dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-7">
            <div className="border border-line bg-panel/40 p-6 sm:p-8">
              <p className="label mb-8 text-muted">Contract pitch</p>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
