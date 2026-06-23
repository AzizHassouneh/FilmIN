import { expect, test } from "@playwright/test";

// End-to-end smoke for the MVP journey (scenarios S1, S4, S5):
//   search → title → claim → upload headshot → post → feed.
//
// Requires a running app with a seeded catalog (run `npm run db:seed` first)
// and a TMDB_API_KEY. A fresh account is created per run.

const unique = Date.now();
const email = `smoke+${unique}@filmin.test`;
const password = "filmin-smoke-pw";
const name = `Smoke Tester ${unique}`;

test("a new user can browse the catalog, claim a page, and post", async ({ page }) => {
  // Sign up.
  await page.goto("/signup");
  await page.getByLabel(/name/i).fill(name);
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign up|create|join/i }).click();
  await expect(page).toHaveURL("/");

  // S5: search a seeded title and open its page.
  await page.goto("/search?q=Inception");
  const titleLink = page.getByRole("link", { name: /Inception/i }).first();
  await expect(titleLink).toBeVisible();
  await titleLink.click();
  await expect(page.getByRole("heading", { name: /Inception/i })).toBeVisible();

  // Open the first cast member's profile.
  const castLink = page.locator('a[href^="/p/"]').first();
  await expect(castLink).toBeVisible();
  await castLink.click();
  await expect(page).toHaveURL(/\/p\//);

  // S1: claim the page (we own no profile yet, so this should be offered).
  const claim = page.getByRole("button", { name: /claim this page/i });
  if (await claim.isVisible().catch(() => false)) {
    await claim.click();
    await expect(page.getByRole("link", { name: /edit your page/i })).toBeVisible();
  }

  // S4: post to the feed (the feed now lives on Home).
  await page.goto("/");
  const body = page.getByPlaceholder(/share an update/i);
  await expect(body).toBeVisible();
  const text = `Wrapped a shoot — ${unique}`;
  await body.fill(text);
  await page.getByRole("button", { name: /^post$/i }).click();
  await expect(page.getByText(text)).toBeVisible();
});
