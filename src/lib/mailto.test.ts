import { describe, expect, it } from "vitest";
import { buildMailtoBody, buildMailtoUrl, type ContactPayload } from "./mailto";
import { profile } from "@/data/profile";

const payload: ContactPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  organization: "Analytical Engines",
  engagement: "Technical direction",
  timeline: "Immediate",
  brief: "Need architecture direction for a booking platform.",
};

describe("buildMailtoBody", () => {
  it("includes every populated field with a label", () => {
    const body = buildMailtoBody(payload);
    expect(body).toContain("Name: Ada Lovelace");
    expect(body).toContain("Email: ada@example.com");
    expect(body).toContain("Organization: Analytical Engines");
    expect(body).toContain("Engagement type: Technical direction");
    expect(body).toContain("Timeline: Immediate");
    expect(body).toContain("Scope brief: Need architecture direction for a booking platform.");
  });

  it("omits empty fields", () => {
    const body = buildMailtoBody({
      name: "Ada",
      email: "ada@example.com",
      brief: "A brief description of the required scope.",
    });
    expect(body).not.toContain("Organization:");
    expect(body).not.toContain("Timeline:");
  });
});

describe("buildMailtoUrl", () => {
  it("targets the profile email and encodes the subject and body", () => {
    const url = buildMailtoUrl(payload);
    expect(url.startsWith(`mailto:${profile.email}?`)).toBe(true);

    const params = new URLSearchParams(url.slice(url.indexOf("?") + 1));
    expect(params.get("subject")).toBe("Contract enquiry — Ada Lovelace");
    expect(params.get("body")).toContain("Name: Ada Lovelace");
  });

  it("accepts an explicit recipient", () => {
    const url = buildMailtoUrl(payload, "other@example.com");
    expect(url.startsWith("mailto:other@example.com?")).toBe(true);
  });
});
