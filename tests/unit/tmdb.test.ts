import { describe, expect, it } from "vitest";
import { tmdbImageUrl, tmdbYear } from "@/lib/tmdb";

describe("tmdbYear", () => {
  it("extracts the year from a TMDB date string", () => {
    expect(tmdbYear("2010-07-16")).toBe(2010);
    expect(tmdbYear("1994-09-23")).toBe(1994);
  });

  it("returns null for missing or malformed dates", () => {
    expect(tmdbYear(undefined)).toBeNull();
    expect(tmdbYear("")).toBeNull();
    expect(tmdbYear("not-a-date")).toBeNull();
  });
});

describe("tmdbImageUrl", () => {
  it("builds a full URL at the default size", () => {
    expect(tmdbImageUrl("/abc.jpg")).toBe("https://image.tmdb.org/t/p/w500/abc.jpg");
  });

  it("honors an explicit size", () => {
    expect(tmdbImageUrl("/abc.jpg", "w342")).toBe("https://image.tmdb.org/t/p/w342/abc.jpg");
  });

  it("returns null when there is no path", () => {
    expect(tmdbImageUrl(null)).toBeNull();
    expect(tmdbImageUrl(undefined)).toBeNull();
  });
});
