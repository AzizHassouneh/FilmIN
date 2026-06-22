import { prisma } from "@/lib/db";
import {
  getMovieDetail,
  getTvDetail,
  tmdbImageUrl,
  tmdbYear,
  type TmdbCredits,
  type TmdbMediaType,
} from "@/lib/tmdb";

/** kebab-case a name and suffix the TMDB person id to guarantee uniqueness. */
export function profileSlug(name: string, tmdbPersonId: number): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "person"}-${tmdbPersonId}`;
}

/**
 * Import one TMDB title into our DB: upsert the Title, upsert a (claimable) stub
 * ProfessionalProfile per cast/crew member, and upsert their Credits.
 * Idempotent — safe to re-run. Returns the local Title id.
 */
export async function importTitle(
  tmdbId: number,
  mediaType: TmdbMediaType,
): Promise<string> {
  const isMovie = mediaType === "movie";
  let name: string;
  let year: number | null;
  let overview: string | undefined;
  let posterPath: string | null | undefined;
  let credits: TmdbCredits;

  if (isMovie) {
    const m = await getMovieDetail(tmdbId);
    name = m.title;
    year = tmdbYear(m.release_date);
    overview = m.overview;
    posterPath = m.poster_path;
    credits = m.credits;
  } else {
    const t = await getTvDetail(tmdbId);
    name = t.name;
    year = tmdbYear(t.first_air_date);
    overview = t.overview;
    posterPath = t.poster_path;
    credits = t.credits ?? t.aggregate_credits ?? { cast: [], crew: [] };
  }

  const title = await prisma.title.upsert({
    where: { tmdbId },
    create: {
      tmdbId,
      mediaType: isMovie ? "MOVIE" : "TV",
      name,
      year,
      overview,
      posterUrl: tmdbImageUrl(posterPath),
    },
    update: {
      name,
      year,
      overview,
      posterUrl: tmdbImageUrl(posterPath),
    },
  });

  // Cast (top billing only — keep the graph focused for the MVP).
  for (const person of credits.cast.slice(0, 20)) {
    const profile = await upsertProfileStub(person.id, person.name, person.profile_path);
    await prisma.credit.upsert({
      where: {
        profileId_titleId_kind_job_character: {
          profileId: profile.id,
          titleId: title.id,
          kind: "CAST",
          job: "",
          character: person.character ?? "",
        },
      },
      create: {
        profileId: profile.id,
        titleId: title.id,
        kind: "CAST",
        character: person.character ?? "",
        job: "",
        order: person.order,
      },
      update: { order: person.order },
    });
  }

  // Crew — keep the principal departments that matter for a filmography.
  const keepDepartments = new Set(["Directing", "Writing", "Production", "Camera", "Sound", "Editing"]);
  for (const person of credits.crew.filter((c) => keepDepartments.has(c.department ?? ""))) {
    const profile = await upsertProfileStub(person.id, person.name, person.profile_path);
    await prisma.credit.upsert({
      where: {
        profileId_titleId_kind_job_character: {
          profileId: profile.id,
          titleId: title.id,
          kind: "CREW",
          job: person.job ?? "",
          character: "",
        },
      },
      create: {
        profileId: profile.id,
        titleId: title.id,
        kind: "CREW",
        department: person.department,
        job: person.job ?? "",
        character: "",
      },
      update: { department: person.department },
    });
  }

  return title.id;
}

async function upsertProfileStub(
  tmdbPersonId: number,
  name: string,
  profilePath: string | null | undefined,
) {
  return prisma.professionalProfile.upsert({
    where: { tmdbPersonId },
    // Only fill the headshot/name on create; never overwrite a claimed owner's
    // curated profile on re-import.
    create: {
      tmdbPersonId,
      displayName: name,
      slug: profileSlug(name, tmdbPersonId),
      headshotUrl: tmdbImageUrl(profilePath, "w342"),
      roles: [],
    },
    update: {},
  });
}
