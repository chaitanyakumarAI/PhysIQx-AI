import { expect, test, type Page } from "@playwright/test";

/**
 * Local-first, end to end: a workout logged with no connection is saved on
 * the device and queued; when the connection returns, delivery starts on
 * its own. As a guest the upload waits for sign-in (never "failing"); with
 * a test account (E2E_EMAIL / E2E_PASSWORD — the owner's, never committed)
 * the queue empties, meaning the rows reached Supabase.
 */

interface OutboxEntry {
  key: string;
  attempts: number;
}

const outbox = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("physiqx-outbox") ?? "[]") as OutboxEntry[]);
const workoutsQueued = async (page: Page) => (await outbox(page)).filter((entry) => entry.key.startsWith("workout:"));

/** Adopts a program, then opens its first day the way Home's start button does. */
async function startWorkout(page: Page) {
  await page.goto("/train/programs/full-body");
  await page.getByRole("button", { name: "Adopt as my plan" }).click();
  const missionId = await page.evaluate(() => {
    const { plans, activePlanId } = JSON.parse(localStorage.getItem("physiqx-plans") ?? "{}").state ?? {};
    const plan = (plans as { id: string; days: { id: string }[] }[]).find((entry) => entry.id === activePlanId)!;
    return `plan-${plan.id}-${plan.days[0]!.id}`;
  });
  await page.goto(`/session/${missionId}`);
  await expect(page.getByLabel(/Elapsed time/)).toBeVisible();
}

async function logOneSetAndFinish(page: Page) {
  await page.getByLabel("Weight in kg").first().fill("60");
  await page.getByLabel(/^Reps, target/).first().fill("10");
  await page.getByRole("button", { name: "Mark set 1 complete" }).first().click();
  await page.getByRole("button", { name: "Finish workout" }).click();
}

async function logOfflineThenReconnect(page: Page) {
  await startWorkout(page);
  await page.context().setOffline(true);
  // The workout screen has no network banner (it stays uncluttered); check the browser itself.
  expect(await page.evaluate(() => navigator.onLine)).toBe(false);
  await logOneSetAndFinish(page);

  // Saved on the device, waiting in the outbox.
  await expect.poll(async () => (await workoutsQueued(page)).length).toBe(1);
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("physiqx-session") ?? "{}").state?.history?.length ?? 0,
  );
  expect(saved).toBe(1);

  // Back online: a delivery attempt (a Server Action POST) goes out by itself.
  const attempt = page.waitForRequest((request) => request.method() === "POST" && "next-action" in request.headers());
  await page.context().setOffline(false);
  await attempt;
}

test("a guest's offline workout is kept and waits for sign-in without failing", async ({ page }) => {
  await logOfflineThenReconnect(page);
  await expect.poll(async () => (await workoutsQueued(page))[0]?.attempts).toBe(0);
  await expect(page.getByText(/waiting to sync/)).toHaveCount(0);
});

test("a signed-in athlete's offline workout reaches the server once back online", async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  test.skip(!email || !password, "Set E2E_EMAIL and E2E_PASSWORD (a test account) to run this one.");

  await page.goto("/login");
  await page.getByLabel(/email/i).fill(email!);
  await page.getByLabel(/password/i).first().fill(password!);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/home/);

  await logOfflineThenReconnect(page);
  await expect.poll(async () => (await workoutsQueued(page)).length, { timeout: 60_000 }).toBe(0);
});
