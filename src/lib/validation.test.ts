import { describe, expect, it } from "vitest";
import { hasErrors, validateContact } from "./validation";
import type { ContactPayload } from "./mailto";

const valid: ContactPayload = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  brief: "Architecture direction for a booking platform.",
};

describe("validateContact", () => {
  it("passes a complete payload", () => {
    const errors = validateContact(valid);
    expect(hasErrors(errors)).toBe(false);
  });

  it("requires a name of at least two characters", () => {
    expect(validateContact({ ...valid, name: "A" }).name).toBeDefined();
  });

  it("rejects malformed email addresses", () => {
    expect(validateContact({ ...valid, email: "not-an-email" }).email).toBeDefined();
    expect(validateContact({ ...valid, email: "" }).email).toBeDefined();
  });

  it("requires a brief of at least twenty characters", () => {
    expect(validateContact({ ...valid, brief: "too short" }).brief).toBeDefined();
  });

  it("flags all invalid fields at once", () => {
    const errors = validateContact({ name: "", email: "x", brief: "" });
    expect(hasErrors(errors)).toBe(true);
    expect(Object.keys(errors)).toHaveLength(3);
  });
});
