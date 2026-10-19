import { profile } from "@/data/profile";

export interface ContactPayload {
  name: string;
  email: string;
  organization?: string;
  engagement?: string;
  timeline?: string;
  brief: string;
}

const FIELD_LABELS: Array<[keyof ContactPayload, string]> = [
  ["name", "Name"],
  ["email", "Email"],
  ["organization", "Organization"],
  ["engagement", "Engagement type"],
  ["timeline", "Timeline"],
  ["brief", "Scope brief"],
];

export function buildMailtoBody(payload: ContactPayload): string {
  const lines: string[] = [];
  for (const [key, label] of FIELD_LABELS) {
    const value = payload[key];
    if (value && value.trim().length > 0) {
      lines.push(`${label}: ${value.trim()}`);
    }
  }
  return lines.join("\n");
}

export function buildMailtoUrl(
  payload: ContactPayload,
  to: string = profile.email,
): string {
  const subject = `Contract enquiry — ${payload.name.trim()}`;
  const params = new URLSearchParams({
    subject,
    body: buildMailtoBody(payload),
  });
  return `mailto:${to}?${params.toString()}`;
}
