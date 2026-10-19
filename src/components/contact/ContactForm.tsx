"use client";

import { useState, type FormEvent } from "react";
import { profile } from "@/data/profile";
import { buildMailtoUrl, type ContactPayload } from "@/lib/mailto";
import { hasErrors, validateContact, type ContactErrors } from "@/lib/validation";
import { cn } from "@/lib/cn";

const initialValues: ContactPayload = {
  name: "",
  email: "",
  organization: "",
  engagement: "",
  timeline: "",
  brief: "",
};

const inputClass =
  "w-full border border-line bg-ink-2 px-4 py-3 text-sm text-bone placeholder:text-muted/60 transition-colors focus:border-accent focus:outline-none";

const labelClass = "label mb-2 block text-muted";

export function ContactForm() {
  const [values, setValues] = useState<ContactPayload>(initialValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [trap, setTrap] = useState("");

  function update<K extends keyof ContactPayload>(key: K, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trap.length > 0) {
      return;
    }

    const nextErrors = validateContact(values);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      setStatus("idle");
      return;
    }

    window.location.href = buildMailtoUrl(values, profile.email);
    setStatus("sent");
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={cn(inputClass, errors.name && "border-accent")}
            placeholder="Full name"
          />
          {errors.name ? (
            <p id="contact-name-error" className="label mt-2 text-accent">
              {errors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label htmlFor="contact-email" className={labelClass}>
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={cn(inputClass, errors.email && "border-accent")}
            placeholder="you@company.com"
          />
          {errors.email ? (
            <p id="contact-email-error" className="label mt-2 text-accent">
              {errors.email}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-organization" className={labelClass}>
            Organization
          </label>
          <input
            id="contact-organization"
            name="organization"
            type="text"
            autoComplete="organization"
            value={values.organization}
            onChange={(event) => update("organization", event.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </div>

        <div>
          <label htmlFor="contact-engagement" className={labelClass}>
            Engagement type
          </label>
          <select
            id="contact-engagement"
            name="engagement"
            value={values.engagement}
            onChange={(event) => update("engagement", event.target.value)}
            className={cn(inputClass, "appearance-none")}
          >
            <option value="">Select one</option>
            <option value="Technical direction">Technical direction</option>
            <option value="Full-stack build">Full-stack build</option>
            <option value="3D / VR build">3D / VR build</option>
            <option value="Systems architecture">Systems architecture</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="contact-timeline" className={labelClass}>
          Timeline
        </label>
        <select
          id="contact-timeline"
          name="timeline"
          value={values.timeline}
          onChange={(event) => update("timeline", event.target.value)}
          className={cn(inputClass, "appearance-none")}
        >
          <option value="">Select one</option>
          <option value="Immediate">Immediate</option>
          <option value="1–3 months">1–3 months</option>
          <option value="3–6 months">3–6 months</option>
          <option value="Flexible">Flexible</option>
        </select>
      </div>

      <div>
        <label htmlFor="contact-brief" className={labelClass}>
          Scope brief
        </label>
        <textarea
          id="contact-brief"
          name="brief"
          rows={6}
          value={values.brief}
          onChange={(event) => update("brief", event.target.value)}
          aria-invalid={Boolean(errors.brief)}
          aria-describedby={errors.brief ? "contact-brief-error" : undefined}
          className={cn(inputClass, "resize-y", errors.brief && "border-accent")}
          placeholder="Systems involved, constraints, and the outcome you need."
        />
        {errors.brief ? (
          <p id="contact-brief-error" className="label mt-2 text-accent">
            {errors.brief}
          </p>
        ) : null}
      </div>

      <div aria-hidden="true" className="hidden">
        <label htmlFor="contact-company-url">Leave this field empty</label>
        <input
          id="contact-company-url"
          name="companyUrl"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={trap}
          onChange={(event) => setTrap(event.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 pt-2">
        <button
          type="submit"
          className="label inline-flex items-center gap-2.5 border border-accent bg-accent px-5 py-3.5 text-ink transition-colors hover:border-bone hover:bg-bone"
        >
          Send pitch
          <span aria-hidden="true">→</span>
        </button>
        <p aria-live="polite" className="label text-muted">
          {status === "sent"
            ? "Mail client opened with your brief."
            : "Opens in your mail client — no data leaves the browser."}
        </p>
      </div>
    </form>
  );
}
