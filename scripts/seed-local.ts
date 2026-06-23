// Offline seed for local development & live journey testing — NO TMDB key needed.
// Inserts a small, interconnected catalog (shared people → "worked-with" graph),
// leaves the profiles as unclaimed stubs, and creates two test user accounts.
// Idempotent-ish: clears the social/catalog tables first, then reinserts.
//
// Run: `npm run db:seed:local`
//
// Catalog facts are common knowledge; poster images are loaded from TMDB's public
// image CDN (no API key required for images). The app still attributes TMDB.
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { profileSlug } from "@/lib/catalog";

const IMG = "https://image.tmdb.org/t/p/w500";
const HEAD = "https://image.tmdb.org/t/p/w342";

// People (id is a stable fake "tmdbPersonId" used for the slug + uniqueness).
const people = {
  nolan: { id: 525, name: "Christopher Nolan", head: "/xuAIuYSmsUzKlUMBFGVZaWsy3DZ.jpg" },
  caine: { id: 3895, name: "Michael Caine", head: "/hZILEW8OnZN1rnf1Jz8E4FYwSDV.jpg" },
  murphy: { id: 2037, name: "Cillian Murphy", head: "/llkbyWKwpfowZ6C8peBjIV9jj99.jpg" },
  dicaprio: { id: 6193, name: "Leonardo DiCaprio", head: "/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg" },
  hathaway: { id: 1813, name: "Anne Hathaway", head: "/dPgrZM0sZqyWLZkjnLnpvWuFn7G.jpg" },
  mcconaughey: { id: 10297, name: "Matthew McConaughey", head: "/sY2mwpafcwqyYS1sOySu1MENDse.jpg" },
  ledger: { id: 1810, name: "Heath Ledger", head: "/5Y9HnYYa9jF4NunY9lSgJGjSUzd.jpg" },
  bale: { id: 3894, name: "Christian Bale", head: "/qCpZn2e3dimwbryLnqxZuI88PTi.jpg" },
  zimmer: { id: 947, name: "Hans Zimmer", head: "/tpQnDeHY15szIXvpnhlprS0XOln.jpg" },
} as const;

type Person = (typeof people)[keyof typeof people];

// Titles with their cast (character) and crew (job/department).
const titles: Array<{
  tmdbId: number;
  mediaType: "MOVIE" | "TV";
  name: string;
  year: number;
  overview: string;
  poster: string;
  cast: Array<{ p: Person; character: string; order: number }>;
  crew: Array<{ p: Person; job: string; department: string }>;
}> = [
  {
    tmdbId: 27205,
    mediaType: "MOVIE",
    name: "Inception",
    year: 2010,
    overview:
      "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    poster: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg",
    cast: [
      { p: people.dicaprio, character: "Dom Cobb", order: 0 },
      { p: people.murphy, character: "Robert Fischer", order: 1 },
      { p: people.caine, character: "Miles", order: 2 },
    ],
    crew: [
      { p: people.nolan, job: "Director", department: "Directing" },
      { p: people.nolan, job: "Writer", department: "Writing" },
      { p: people.zimmer, job: "Original Music Composer", department: "Sound" },
    ],
  },
  {
    tmdbId: 157336,
    mediaType: "MOVIE",
    name: "Interstellar",
    year: 2014,
    overview:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    poster: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    cast: [
      { p: people.mcconaughey, character: "Cooper", order: 0 },
      { p: people.hathaway, character: "Brand", order: 1 },
      { p: people.caine, character: "Professor Brand", order: 2 },
    ],
    crew: [
      { p: people.nolan, job: "Director", department: "Directing" },
      { p: people.zimmer, job: "Original Music Composer", department: "Sound" },
    ],
  },
  {
    tmdbId: 155,
    mediaType: "MOVIE",
    name: "The Dark Knight",
    year: 2008,
    overview:
      "Batman raises the stakes in his war on crime with the help of Lt. Jim Gordon and DA Harvey Dent, until a rising criminal known as the Joker plunges Gotham into anarchy.",
    poster: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    cast: [
      { p: people.bale, character: "Bruce Wayne", order: 0 },
      { p: people.ledger, character: "Joker", order: 1 },
      { p: people.caine, character: "Alfred", order: 2 },
      { p: people.murphy, character: "Scarecrow", order: 3 },
    ],
    crew: [
      { p: people.nolan, job: "Director", department: "Directing" },
      { p: people.zimmer, job: "Original Music Composer", department: "Sound" },
    ],
  },
];

async function main() {
  console.log("Clearing existing data…");
  await prisma.postLike.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.credit.deleteMany();
  await prisma.title.deleteMany();
  await prisma.professionalProfile.deleteMany();
  // Leave NextAuth tables; just clear our two test users if present.
  await prisma.user.deleteMany({ where: { email: { in: ["alice@filmin.test", "bob@filmin.test"] } } });

  console.log("Seeding profile stubs…");
  const profileIds = new Map<number, string>();
  for (const p of Object.values(people)) {
    const profile = await prisma.professionalProfile.create({
      data: {
        tmdbPersonId: p.id,
        displayName: p.name,
        slug: profileSlug(p.name, p.id),
        headshotUrl: `${HEAD}${p.head}`,
        roles: [],
      },
    });
    profileIds.set(p.id, profile.id);
  }

  console.log("Seeding titles + credits…");
  for (const t of titles) {
    const title = await prisma.title.create({
      data: {
        tmdbId: t.tmdbId,
        mediaType: t.mediaType,
        name: t.name,
        year: t.year,
        overview: t.overview,
        posterUrl: `${IMG}${t.poster}`,
      },
    });
    for (const c of t.cast) {
      await prisma.credit.create({
        data: {
          profileId: profileIds.get(c.p.id)!,
          titleId: title.id,
          kind: "CAST",
          character: c.character,
          job: "",
          order: c.order,
        },
      });
    }
    for (const c of t.crew) {
      await prisma.credit.create({
        data: {
          profileId: profileIds.get(c.p.id)!,
          titleId: title.id,
          kind: "CREW",
          department: c.department,
          job: c.job,
          character: "",
        },
      });
    }
  }

  console.log("Creating test user accounts…");
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.create({
    data: { name: "Alice Tester", email: "alice@filmin.test", passwordHash },
  });
  await prisma.user.create({
    data: { name: "Bob Tester", email: "bob@filmin.test", passwordHash },
  });

  const titleCount = await prisma.title.count();
  const profileCount = await prisma.professionalProfile.count();
  console.log(
    `\nDone. ${titleCount} titles, ${profileCount} profiles, 2 test users seeded.`,
  );
  console.log("Test logins (password for both: password123):");
  console.log("  • alice@filmin.test");
  console.log("  • bob@filmin.test");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
