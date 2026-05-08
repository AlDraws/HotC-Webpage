import { describe, it, expect } from "vitest";
import {
  normalizeHref,
  isExternalHref,
  localizeHref,
  resolveAppLinkHref,
  resolveLinkProps,
  getLinkHref,
  getLinkTarget,
} from "./links";

describe("normalizeHref", () => {
  it("returns mailto: unchanged", () => {
    expect(normalizeHref("mailto:hello@example.com")).toBe("mailto:hello@example.com");
  });

  it("returns tel: unchanged", () => {
    expect(normalizeHref("tel:+1234567890")).toBe("tel:+1234567890");
  });

  it("returns https: unchanged", () => {
    expect(normalizeHref("https://example.com")).toBe("https://example.com");
  });

  it("upgrades protocol-relative URL to https", () => {
    expect(normalizeHref("//example.com/path")).toBe("https://example.com/path");
  });

  it("returns root-relative path unchanged", () => {
    expect(normalizeHref("/en/characters")).toBe("/en/characters");
  });

  it("returns hash-only unchanged", () => {
    expect(normalizeHref("#section")).toBe("#section");
  });

  it("prepends https:// to bare hostname", () => {
    expect(normalizeHref("example.com")).toBe("https://example.com");
  });

  it("trims leading whitespace", () => {
    expect(normalizeHref("  https://example.com")).toBe("https://example.com");
  });

  it("returns empty string unchanged", () => {
    expect(normalizeHref("")).toBe("");
  });

  it("handles custom scheme (e.g. ftp:)", () => {
    expect(normalizeHref("ftp://files.example.com")).toBe("ftp://files.example.com");
  });
});

describe("isExternalHref", () => {
  it("returns true for https:// URL", () => {
    expect(isExternalHref("https://example.com")).toBe(true);
  });

  it("returns false for protocol-relative URL (normalizeHref converts // to https:// first)", () => {
    // isExternalHref is called on already-normalized hrefs; startsWith("/") fires first
    expect(isExternalHref("//example.com")).toBe(false);
    // The normalized form is correctly identified as external:
    expect(isExternalHref("https://example.com")).toBe(true);
  });

  it("returns true for mailto:", () => {
    expect(isExternalHref("mailto:a@b.com")).toBe(true);
  });

  it("returns false for root-relative path", () => {
    expect(isExternalHref("/en/characters")).toBe(false);
  });

  it("returns false for hash-only", () => {
    expect(isExternalHref("#top")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isExternalHref("")).toBe(false);
  });
});

describe("localizeHref", () => {
  it("replaces existing locale prefix", () => {
    expect(localizeHref("/en/characters", "es")).toBe("/es/characters");
  });

  it("adds locale prefix to un-prefixed path", () => {
    expect(localizeHref("/characters", "en")).toBe("/en/characters");
  });

  it("handles root path /", () => {
    expect(localizeHref("/", "es")).toBe("/es");
  });

  it("preserves query string", () => {
    expect(localizeHref("/en/episodes?page=2", "es")).toBe("/es/episodes?page=2");
  });

  it("preserves hash fragment", () => {
    expect(localizeHref("/en/lore#section", "es")).toBe("/es/lore#section");
  });

  it("returns hash-only href unchanged", () => {
    expect(localizeHref("#anchor", "es")).toBe("#anchor");
  });

  it("returns external href unchanged", () => {
    expect(localizeHref("https://external.com", "es")).toBe("https://external.com");
  });

  it("handles deep nested paths", () => {
    expect(localizeHref("/en/lore/the-collapse", "es")).toBe("/es/lore/the-collapse");
  });
});

describe("resolveAppLinkHref", () => {
  it("resolves home document link", () => {
    const field = { link_type: "Document", type: "home" };
    expect(resolveAppLinkHref(field, "en")).toBe("/en");
  });

  it("resolves episode document link", () => {
    const field = { link_type: "Document", type: "episode", uid: "chapter-1" };
    expect(resolveAppLinkHref(field, "en")).toBe("/en/episodes/chapter-1");
  });

  it("resolves character document link", () => {
    const field = { link_type: "Document", type: "character", uid: "aria" };
    expect(resolveAppLinkHref(field, "es")).toBe("/es/characters/aria");
  });

  it("resolves lore_entry document link", () => {
    const field = { link_type: "Document", type: "lore_entry", uid: "the-collapse" };
    expect(resolveAppLinkHref(field, "en")).toBe("/en/lore/the-collapse");
  });

  it("returns null for episode without uid", () => {
    const field = { link_type: "Document", type: "episode" };
    expect(resolveAppLinkHref(field, "en")).toBeNull();
  });

  it("resolves media/web link with url", () => {
    const field = { url: "https://example.com" };
    expect(resolveAppLinkHref(field, "en")).toBe("https://example.com");
  });

  it("returns null for empty object", () => {
    expect(resolveAppLinkHref({}, "en")).toBeNull();
  });
});

describe("resolveLinkProps", () => {
  it("normalizes bare external hostnames", () => {
    expect(resolveLinkProps({ url: "www.google.com" })).toEqual({
      href: "https://www.google.com",
      isExternal: true,
      target: undefined,
      rel: undefined,
    });
  });

  it("applies locale-aware document routing", () => {
    expect(
      resolveLinkProps({ link_type: "Document", type: "character", uid: "aria" }, { locale: "es" })
    ).toEqual({
      href: "/es/characters/aria",
      isExternal: false,
      target: undefined,
      rel: undefined,
    });
  });

  it("adds rel when external links default to a new tab", () => {
    expect(resolveLinkProps({ url: "amazon.com" }, { defaultExternalTarget: "_blank" })).toEqual({
      href: "https://amazon.com",
      isExternal: true,
      target: "_blank",
      rel: "noopener noreferrer",
    });
  });
});

describe("getLinkHref", () => {
  it("extracts url from media link field", () => {
    expect(getLinkHref({ url: "https://example.com" })).toBe("https://example.com");
  });

  it("returns null when url is missing", () => {
    expect(getLinkHref({ link_type: "Document" })).toBeNull();
  });

  it("returns null for null input", () => {
    expect(getLinkHref(null)).toBeNull();
  });

  it("trims url whitespace", () => {
    expect(getLinkHref({ url: "  https://example.com  " })).toBe("https://example.com");
  });
});

describe("getLinkTarget", () => {
  it("extracts target when present", () => {
    expect(getLinkTarget({ target: "_blank" })).toBe("_blank");
  });

  it("returns undefined when target is missing", () => {
    expect(getLinkTarget({ url: "https://x.com" })).toBeUndefined();
  });

  it("returns undefined for null input", () => {
    expect(getLinkTarget(null)).toBeUndefined();
  });
});
