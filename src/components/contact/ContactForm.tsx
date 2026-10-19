"use client";

import { useState, type FormEvent } from "react";
import { profile } from "@/data/profile";
import { buildMailtoUrl, type ContactPayload } from "@/lib/mailto";
import { hasErrors, validateContact, type ContactErrors } from "@/lib/validation";
import { cn } from "@/lib/cn";
import { motion, useReducedMotion } from "framer-motion";

const initialValues: ContactPayload = {
  name: "",
  email: "",
  organization: "",
  engagement: "",
  timeline: "",
  brief: "",
};

const inputClass =
  "w-full border border-line bg-ink-2 px-4 py-3 text-sm text-bone placeholder:text-muted/60 transition-all duration-200 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 hover:border-line-strong";

const labelClass = "label mb-2 block text-muted transition-colors group-focus-within:text-accent";

export function ContactForm() {
  const [values, setValues] = useState<ContactPayload>(initialValues);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [trap, setTrap] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

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

  const Field = reduceMotion ? "div" : motion.div;

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="group"
        >
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
            onFocus={() => setFocusedField("name")}
            onBlur={() => setFocusedField(null)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={cn(inputClass, errors.name && "border-accent", focusedField === "name" && "ring-2 ring-accent/30")}
            placeholder="Full name"
          />
          {errors.name ? (
            <motion.p
              id="contact-name-error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="label mt-2 text-accent"
            >
              {errors.name}
            </motion.p>
          ) : null}
        </Field>

        <Field
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="group"
        >
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
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={cn(inputClass, errors.email && "border-accent", focusedField === "email" && "ring-2 ring-accent/30")}
            placeholder="you@company.com"
          />
          {errors.email ? (
            <motion.p
              id="contact-email-error"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="label mt-2 text-accent"
            >
              {errors.email}
            </motion.p>
          ) : null}
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="group"
        >
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
            onFocus={() => setFocusedField("organization")}
            onBlur={() => setFocusedField(null)}
            className={cn(inputClass, focusedField === "organization" && "ring-2 ring-accent/30")}
            placeholder="Optional"
          />
        </Field>

        <Field
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="group"
        >
          <label htmlFor="contact-engagement" className={labelClass}>
            Engagement type
          </label>
          <select
            id="contact-engagement"
            name="engagement"
            value={values.engagement}
            onChange={(event) => update("engagement", event.target.value)}
            onFocus={() => setFocusedField("engagement")}
            onBlur={() => setFocusedField(null)}
            className={cn(inputClass, "appearance-none", focusedField === "engagement" && "ring-2 ring-accent/30")}
          >
            <option value="">Select one</option>
            <option value="Technical direction">Technical direction</option>
            <option value="Full-stack build">Full-stack build</option>
            <option value="3D / VR build">3D / VR build</option>
            <option value="Systems architecture">Systems architecture</option>
          </select>
        </Field>
      </div>

      <Field
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="group"
      >
        <label htmlFor="contact-timeline" className={labelClass}>
          Timeline
        </label>
        <select
          id="contact-timeline"
          name="timeline"
          value={values.timeline}
          onChange={(event) => update("timeline", event.target.value)}
          onFocus={() => setFocusedField("timeline")}
          onBlur={() => setFocusedField(null)}
          className={cn(inputClass, "appearance-none", focusedField === "timeline" && "ring-2 ring-accent/30")}
        >
          <option value="">Select one</option>
          <option value="Immediate">Immediate</option>
          <option value="1–3 months">1–3 months</option>
          <option value="3–6 months">3–6 months</option>
          <option value="Flexible">Flexible</option>
        </select>
      </Field>

      <Field
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.35 }}
        className="group"
      >
        <label htmlFor="contact-brief" className={labelClass}>
          Scope brief
        </label>
        <textarea
          id="contact-brief"
          name="brief"
          rows={6}
          value={values.brief}
          onChange={(event) => update("brief", event.target.value)}
          onFocus={() => setFocusedField("brief")}
          onBlur={() => setFocusedField(null)}
          aria-invalid={Boolean(errors.brief)}
          aria-describedby={errors.brief ? "contact-brief-error" : undefined}
          className={cn(inputClass, "resize-y", errors.brief && "border-accent", focusedField === "brief" && "ring-2 ring-accent/30")}
          placeholder="Systems involved, constraints, and the outcome you need."
        />
        {errors.brief ? (
          <motion.p
            id="contact-brief-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="label mt-2 text-accent"
          >
            {errors.brief}
          </motion.p>
        ) : null}
      </Field>

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

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="flex flex-wrap items-center gap-4 pt-2"
      >
        <motion.button
          type="submit"
          className="label inline-flex items-center gap-2.5 border border-accent bg-accent px-5 py-3.5 text-ink transition-all duration-200 hover:border-bone hover:bg-bone hover:shadow-[0_0_24px_rgba(77,216,230,0.3)] focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ink"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Send pitch
          <span aria-hidden="true">→</span>
        </motion.button>
        <motion.p
          aria-live="polite"
          className="label text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {status === "sent"
            ? "Mail client opened with your brief."
            : "Opens in your mail client — no data leaves the browser."}
        </motion.p>
      </motion.div>
    </form>
  );
}
