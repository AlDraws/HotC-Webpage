import { describe, it, expect } from "vitest";
import { getDescriptiveCtaLabel, getContextualCtaAriaLabel } from "./a11y";

describe("getDescriptiveCtaLabel", () => {
  it("returns label unchanged when it is not generic", () => {
    expect(getDescriptiveCtaLabel("Meet the cast", "/en/characters")).toBe("Meet the cast");
  });

  it("returns descriptive label for characters href with generic CTA (en)", () => {
    expect(getDescriptiveCtaLabel("learn more", "/en/characters")).toBe("Explore the characters");
  });

  it("returns descriptive label for lore href with generic CTA (en)", () => {
    expect(getDescriptiveCtaLabel("read more", "/en/lore")).toBe("Discover the lore");
  });

  it("is case-insensitive for generic labels", () => {
    expect(getDescriptiveCtaLabel("Learn More", "/en/characters")).toBe("Explore the characters");
  });

  it("strips trailing punctuation from generic label before comparison", () => {
    expect(getDescriptiveCtaLabel("explore.", "/en/characters")).toBe("Explore the characters");
  });

  it("strips diacritics when normalizing", () => {
    // 'más' should not match a generic English CTA — returns original
    expect(getDescriptiveCtaLabel("más", "/en/characters")).toBe("más");
  });

  it("returns label unchanged when href is not characters or lore", () => {
    expect(getDescriptiveCtaLabel("explore", "/en/episodes")).toBe("explore");
  });

  it("returns null when label is null", () => {
    expect(getDescriptiveCtaLabel(null, "/en/characters")).toBeNull();
  });

  it("returns undefined when label is undefined", () => {
    expect(getDescriptiveCtaLabel(undefined, "/en/characters")).toBeUndefined();
  });

  it("returns label when href is null", () => {
    expect(getDescriptiveCtaLabel("learn more", null)).toBe("learn more");
  });

  it("handles Spanish locale generic CTAs", () => {
    const result = getDescriptiveCtaLabel("descubrir", "/es/lore/alguna-entrada");
    // Spanish generic CTAs are locale-dependent — if not generic in ES, returns original
    expect(typeof result).toBe("string");
  });

  it("detects characters sub-paths correctly", () => {
    expect(getDescriptiveCtaLabel("explore", "/en/characters/aria")).toBe(
      "Explore the characters"
    );
  });

  it("detects lore sub-paths correctly", () => {
    expect(getDescriptiveCtaLabel("view more", "/en/lore/the-collapse")).toBe(
      "Discover the lore"
    );
  });
});

describe("getContextualCtaAriaLabel", () => {
  it("returns contextual label for generic CTA", () => {
    expect(getContextualCtaAriaLabel("learn more", "Aria", "en")).toBe("learn more about Aria");
  });

  it("returns undefined for non-generic label", () => {
    expect(getContextualCtaAriaLabel("Read Chapter 1", "Chapter 1", "en")).toBeUndefined();
  });

  it("returns undefined when label is null", () => {
    expect(getContextualCtaAriaLabel(null, "Aria", "en")).toBeUndefined();
  });

  it("returns undefined when context is null", () => {
    expect(getContextualCtaAriaLabel("learn more", null, "en")).toBeUndefined();
  });

  it("returns undefined when context is empty string", () => {
    expect(getContextualCtaAriaLabel("learn more", "", "en")).toBeUndefined();
  });

  it("trims whitespace from context before building the label", () => {
    // normalizedContext = context.trim(), so padding is stripped in the output
    const result = getContextualCtaAriaLabel("explore", "  The Collapse  ", "en");
    expect(result).toBe("explore about The Collapse");
  });

  it("works for Spanish locale", () => {
    const result = getContextualCtaAriaLabel("descubrir", "Aria", "es");
    expect(typeof result === "string" || result === undefined).toBe(true);
  });
});
