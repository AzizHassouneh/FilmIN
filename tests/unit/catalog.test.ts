import { describe, expect, it } from "vitest";
import { profileSlug } from "@/lib/catalog";

describe("profileSlug", () => {
  it("kebab-cases the name and suffixes the TMDB person id", () => {
    expect(profileSlug("Maya Okafor", 12345)).toBe("maya-okafor-12345");
  });

  it("strips punctuation and collapses separators", () => {
    expect(profileSlug("Robert  Downey, Jr.", 3223)).toBe("robert-downey-jr-3223");
  });

  it("normalizes accented characters", () => {
    expect(profileSlug("Penélope Cruz", 955)).toBe("penelope-cruz-955");
  });

  it("falls back to 'person' when the name has no usable characters", () => {
    expect(profileSlug("!!!", 7)).toBe("person-7");
  });

  it("always keeps the id suffix so slugs stay unique", () => {
    const a = profileSlug("John Smith", 1);
    const b = profileSlug("John Smith", 2);
    expect(a).not.toBe(b);
    expect(a.endsWith("-1")).toBe(true);
    expect(b.endsWith("-2")).toBe(true);
  });
});
