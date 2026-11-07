# PhysIQx — Deployment checklist

*Written 2026-11-07. Code-side readiness is done; the steps below are the
owner's (accounts, DNS, dashboards). Check current prices on each site.*

## Already done in code

- Production build passes locally and in CI (Node 22).
- Security headers: CSP (app + Supabase only), no framing, HSTS, nosniff,
  referrer policy, camera/mic/location off (`next.config.ts`).
- Fonts bundled with the app, so builds don't download from Google.
- Service worker v6: data is network-first, so a deploy reaches returning
  users immediately; offline still works.
- Dependencies patched within current majors (Next 15.5.29). Known leftover:
  Next 15's bundled PostCSS advisory (build-time only), cleared by Next 16.
- Supabase: migrations 001–008 applied, RLS cross-account check passed, sync
  restore verified on a fresh browser.

## Closed beta first (owner decision 2026-11-07)

About 10 invited testers, all on free tiers, no domain yet. Steps 1 and the
Resend part of 2 wait for the public launch; the rest still applies.

1. **Email via Gmail (free, no domain).** Make a separate Gmail account for
   the app (e.g. `physiqx.app@gmail.com`), not your personal one.
   - Turn on 2-Step Verification for it: myaccount.google.com → Security.
   - Create an App Password: myaccount.google.com → Security → App
     passwords → name it "Supabase" → copy the 16-character password.
   - Supabase → **Authentication → Emails → SMTP Settings** → enable custom
     SMTP: host `smtp.gmail.com`, port `587`, username = the Gmail address,
     password = the App Password, sender email = the same Gmail address,
     sender name `PhysIQx`.
   - Gmail sends a few hundred emails a day — plenty for a beta.
2. **Vercel Hobby (free)** — step 3 below, skipping the domain. The app
   lives at `https://<project-name>.vercel.app`. A free, invite-only beta is
   non-commercial use.
3. **Supabase URLs** — step 4 below with the vercel.app address as the
   Site URL, and `https://<project-name>.vercel.app/**` in Redirect URLs.
4. **Supabase Free.** Ten active testers keep it awake (only signed-in use
   counts). There are no backups: tell testers it's a beta.
5. **Run the smoke test** (section 6) yourself, then send testers the link.
   On a phone: open it in the browser → Share / menu → *Add to Home
   Screen* to install it like an app.

## 1. A domain

Buy one (any registrar). You need it for the app's address and for sending
email from your own address.

## 2. Email sending (blocker)

Supabase's built-in email is for testing only: it's heavily rate-limited
and only delivers to your own team's addresses, so real users wouldn't get
sign-up confirmations or reset links.

1. Create an account at an email provider, e.g. **Resend** (free tier).
2. In Resend, add your domain and add the DNS records it shows (SPF/DKIM)
   at your registrar. Wait until it says *Verified*.
3. Create an API key in Resend.
4. Supabase dashboard → **Authentication → Emails → SMTP Settings** → enable
   custom SMTP:
   - Host `smtp.resend.com`, port `465`
   - Username `resend`, password = the API key
   - Sender email e.g. `no-reply@yourdomain.com`, sender name `PhysIQx`
5. **Authentication → Rate Limits**: raise the email limit to fit sign-ups.
6. Optional: **Authentication → Emails → Templates** to brand the emails.

## 3. Hosting (Vercel)

1. vercel.com → sign up with GitHub → **Add New → Project** → import
   `chaitanyakumarAI/PhysIQx-AI`. Framework: Next.js (auto-detected).
2. **Environment Variables** (Production and Preview): copy these two from
   `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy.
4. **Settings → General → Node.js Version: 22.x.**
5. **Settings → Domains**: add your domain and set the DNS records Vercel
   shows.
6. Plan: Hobby (free) is for non-commercial use; a commercial app needs Pro.

## 4. Supabase URLs (blocker)

Supabase dashboard → **Authentication → URL Configuration**:

- **Site URL**: `https://yourdomain.com`
- **Redirect URLs** (add all):
  - `https://yourdomain.com/**`
  - `http://localhost:3000/**` (keeps local development working)
  - optional, for Vercel preview deploys: `https://*.vercel.app/**`

Without this, confirmation and reset emails point at localhost.

## 5. Supabase plan

The free plan pauses a project after about a week without activity and has
no automatic backups. Move to Pro once real users depend on it.

## 6. Smoke test after the first deploy

With an email address that is **not** on your Supabase team:

1. Sign up, open the confirmation email, finish onboarding.
2. Log a workout, then open the app on another device and sign in — it
   should appear (restore).
3. Log out, use **Forgot password**, open the link in the same browser, set
   a new password.
4. Install it to the home screen (PWA) and reopen it offline.

## Open decisions (ask Claude to build when ready)

- **Privacy policy and terms** — needed for a public launch, Google sign-in,
  and India's DPDP Act (the app stores weight, body stats, photos).
- **Delete account** — erase the account and its data from Settings (needs
  one SQL migration, 009).
- **Error monitoring** (e.g. Sentry, free tier).
- **Next 16 upgrade** — clears the last dependency advisory.
