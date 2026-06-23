import { expect, test } from "@playwright/test";

// S4 (cross-user): a director claims a page and posts; a follower sees it in
// their feed and can like it. Uses two fresh accounts and a specific seeded
// (unclaimed) profile so the runs don't collide on claim ownership.

const unique = Date.now();
const marker = `Wrapped principal photography — ${unique}`;
const dir = { email: `dir+${unique}@filmin.test`, password: "filmin-smoke-pw", name: `Director ${unique}` };
const fan = { email: `fan+${unique}@filmin.test`, password: "filmin-smoke-pw", name: `Fan ${unique}` };

// A seeded profile slug (Christopher Nolan) — unclaimed until this test claims it.
const PROFILE = "/p/christopher-nolan-525";

async function signup(page: import("@playwright/test").Page, u: typeof dir) {
  await page.goto("/signup");
  await page.getByLabel(/name/i).fill(u.name);
  await page.getByLabel(/email/i).fill(u.email);
  await page.getByLabel(/password/i).fill(u.password);
  await page.getByRole("button", { name: /sign up|create|join/i }).click();
  await expect(page).toHaveURL("/");
}

test("a follower sees a claimed pro's post in their feed and can like it", async ({ browser }) => {
  // ── Director: sign up, claim Nolan's page, post a marker. ──
  const dirCtx = await browser.newContext();
  const dirPage = await dirCtx.newPage();
  await signup(dirPage, dir);
  await dirPage.goto(PROFILE);
  const claim = dirPage.getByRole("button", { name: /claim this page/i });
  await expect(claim).toBeVisible();
  await claim.click();
  await expect(dirPage.getByRole("link", { name: /edit your page/i })).toBeVisible();

  await dirPage.goto("/feed");
  await dirPage.getByPlaceholder(/share an update/i).fill(marker);
  await dirPage.getByRole("button", { name: /^post$/i }).click();
  await expect(dirPage.getByText(marker)).toBeVisible();

  // ── Fan: sign up, follow the director, see the post in their feed, like it. ──
  const fanCtx = await browser.newContext();
  const fanPage = await fanCtx.newPage();
  await signup(fanPage, fan);
  await fanPage.goto(PROFILE);
  await fanPage.getByRole("button", { name: /^follow$/i }).click();
  await expect(fanPage.getByRole("button", { name: /following|unfollow/i })).toBeVisible();

  await fanPage.goto("/feed");
  await expect(fanPage.getByText(marker)).toBeVisible();

  // Like the post.
  const likeBtn = fanPage.getByRole("button", { name: /like/i }).first();
  await likeBtn.click();
  await expect(fanPage.getByText(marker)).toBeVisible();

  await dirCtx.close();
  await fanCtx.close();
});
