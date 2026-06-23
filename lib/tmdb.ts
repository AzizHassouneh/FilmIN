// Typed TMDB API client. TMDB is FilmIN's legal catalog source — we import into
// our own DB (we own the graph; this is not a live proxy). Attribution is shown
// in the app footer per TMDB terms. IMDb is never scraped.
//
// Docs: https://developer.themoviedb.org/reference/intro/getting-started

const TMDB_BASE = "https://api.themoviedb.org/3";
const IMAGE_BASE = "https://image.tmdb.org/t/p";

export type TmdbMediaType = "movie" | "tv";

export interface TmdbMovie {
  id: number;
  title: string;
  release_date?: string;
  overview?: string;
  poster_path?: string | null;
}

export interface TmdbTv {
  id: number;
  name: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string | null;
}

export interface TmdbCastMember {
  id: number;
  name: string;
  character?: string;
  order?: number;
  profile_path?: string | null;
}

export interface TmdbCrewMember {
  id: number;
  name: string;
  department?: string;
  job?: string;
  profile_path?: string | null;
}

export interface TmdbCredits {
  cast: TmdbCastMember[];
  crew: TmdbCrewMember[];
}

export type TmdbMovieDetail = TmdbMovie & { credits: TmdbCredits };
export type TmdbTvDetail = TmdbTv & {
  credits?: TmdbCredits;
  aggregate_credits?: TmdbCredits;
};

export interface TmdbSearchItem {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
  poster_path?: string | null;
  profile_path?: string | null;
}

function apiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) throw new Error("TMDB_API_KEY is not set. See .env.example.");
  return key;
}

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  // Retry on rate-limit (429) and transient 5xx, honoring Retry-After.
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (res.ok) return res.json() as Promise<T>;
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= 4) {
      throw new Error(`TMDB ${path} failed: ${res.status} ${res.statusText}`);
    }
    const retryAfter = Number(res.headers.get("retry-after"));
    const waitMs =
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 500 * 2 ** attempt;
    await new Promise((r) => setTimeout(r, waitMs));
  }
}

/** Build a full poster/headshot URL from a TMDB path, or null. */
export function tmdbImageUrl(
  path: string | null | undefined,
  size: "w185" | "w342" | "w500" | "original" = "w500",
): string | null {
  return path ? `${IMAGE_BASE}/${size}${path}` : null;
}

/** Extract a 4-digit year from a TMDB date string. */
export function tmdbYear(date?: string): number | null {
  if (!date) return null;
  const y = Number.parseInt(date.slice(0, 4), 10);
  return Number.isFinite(y) ? y : null;
}

export function getMovieDetail(tmdbId: number) {
  return tmdb<TmdbMovieDetail>(`/movie/${tmdbId}`, { append_to_response: "credits" });
}

export function getTvDetail(tmdbId: number) {
  return tmdb<TmdbTvDetail>(`/tv/${tmdbId}`, {
    append_to_response: "aggregate_credits,credits",
  });
}

export function searchMulti(query: string, page = 1) {
  return tmdb<{ results: TmdbSearchItem[]; total_results: number }>("/search/multi", {
    query,
    page: String(page),
    include_adult: "false",
  });
}

export function getTrending(window: "day" | "week" = "week") {
  return tmdb<{ results: TmdbSearchItem[] }>(`/trending/all/${window}`);
}

/**
 * Discover the most popular movies released in a given year (paginated, 20/page).
 * Used by the backfill seed to import notable recent titles into our own DB.
 */
export function discoverMovies(year: number, page = 1) {
  return tmdb<{ results: TmdbMovie[]; page: number; total_pages: number }>("/discover/movie", {
    sort_by: "popularity.desc",
    primary_release_year: String(year),
    include_adult: "false",
    "vote_count.gte": "5",
    page: String(page),
  });
}

/** Discover the most popular TV shows first airing in a given year (20/page). */
export function discoverTv(year: number, page = 1) {
  return tmdb<{ results: TmdbTv[]; page: number; total_pages: number }>("/discover/tv", {
    sort_by: "popularity.desc",
    first_air_date_year: String(year),
    include_adult: "false",
    "vote_count.gte": "5",
    page: String(page),
  });
}
