# Student Housing Safety & Confirmation Platform

MVP scaffold built from the PRD + tech doc, Next.js 14 App Router + TypeScript + Tailwind + Prisma 7 (Neon adapter).

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, JWT_SECRET, RESEND_API_KEY
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed              # optional demo data — see accounts below
npm run dev
```

Seeded demo accounts (password for all: `password123`):
- Platform admin (internal) — `admin@campusnest.co.za` — sign in at `/admin/login`
- Landlord — `landlord@example.com` (owns one VERIFIED property with a full checklist)
- Student — `student@example.com` (email pre-verified, has an ACTIVE tenancy — ready to generate a letter)

To walk through the core flow end-to-end after seeding: log in as landlord → confirm the seeded tenancy is ACTIVE → `POST /api/confirmation/generate` with that tenancy's id → log in as admin at `/admin/login` → `/dashboard/admin/letters` → Endorse → Send.

## What I changed from the source docs, and why

I implemented the PRD as given, but the PRD and tech doc had some real gaps and bugs. Rather than reproduce them, I fixed them and I'm flagging each one here so you can override any of these calls.

**1. Prisma schema had a compile error.** `SafetyReport` related to `User` and `Property`, but neither model listed the back-relation field. Prisma would have failed at `generate`. Fixed by adding `reportsFiled` on `User` and `reports` on `Property`.

**2. `ChecklistItem` was named as a required model in the PRD's own Day-1 task list ("Database models: User Property ChecklistItem Tenancy ConfirmationLetter") but the schema you sent used five flat boolean columns on `Property` instead.** I built a real `ChecklistItem` model (13 seeded questions across 5 weighted categories) because it's what a "safety score" actually needs to be defensible: partial completion, per-item notes, and a weighted score instead of "5 booleans, equally weighted, hardcoded." `src/lib/safety.ts` has the scoring logic and the standard question set — this is the one place to edit if you want different questions or weights.

**3. Route groups can't be used for URL-prefix middleware — this would have silently protected nothing.** The tech doc's folder tree puts role-gated pages in `(student)/`, `(landlord)/`, `(admin)/`. Parenthesized segments are Next.js *route groups* and are stripped from the URL, so `(student)/dashboard/page.tsx` serves `/dashboard`, not `/student/dashboard`. Middleware matching on a `/student` prefix would never fire, so the "protected" pages would have been wide open. I moved role-gating into a `layout.tsx` per group (reads the session server-side, redirects if wrong/missing role) and narrowed `middleware.ts` to guard mutating API calls, which is what URL-prefix middleware is actually reliable for.

**4. JWT library swapped from the implied `jsonwebtoken` to `jose`.** `middleware.ts` runs on the Edge runtime, which doesn't have Node's `crypto` module that `jsonwebtoken` needs. `jose` works in both Edge and Node, so there's one JWT implementation instead of two.

**5. Nodemailer → Resend.** Nodemailer needs an SMTP relay (Gmail app password, SES, etc.) configured and debugged — one more moving part for a 4-day build. Resend is a plain HTTPS API call with one API key.

**6. `jsPDF` → `@react-pdf/renderer`.** jsPDF is imperative (`text(x, y, "...")`); the confirmation letter layout will get tweaked repeatedly during the build, and JSX + a stylesheet (`src/lib/pdf.tsx`) is much faster to iterate on than coordinate math.

**7. Two routes were named but not fully specced: `applications` and `reports`.** The PRD explicitly requires students to "submit rental applications" and "submit safety reports," but the tech doc's API route tree only listed `auth`, `properties`, `tenancy`, `confirmation`. Added `POST /api/applications` and `POST /api/reports` to cover this — they weren't in your tree, so double check they match what you had in mind.

**8. Public property detail page (`/properties/[id]`) and the landlord checklist editor (`/landlord/properties/[id]`) weren't in the folder tree either**, but both are required by the PRD ("individual property detail page showing checklist and score," "safety checklist completion per property"). Added both.

**9. PDF generation moved to send-time, not letter-creation-time.** `/api/confirmation/generate` creates the DB record only; `/api/confirmation/send` renders the PDF fresh from current data. Generating and storing a PDF for a letter that might still be rejected by the admin is wasted work and risks the stored file going stale if endorsement details change.

**10. Every state-changing route re-validates server-side** (property must be `VERIFIED`, student must be `emailVerifiedAt`, tenancy must be `ACTIVE`, letter must be `ENDORSED` before it can be sent) rather than trusting flags passed from the client. This is the one I'd push back hardest on if you wanted to simplify — it's slightly more code, but a confirmation letter is a semi-legal document being sent to a funder, so it shouldn't be possible to generate one from stale or client-supplied state.

## What's stubbed / not done

This is a scaffold, not the finished 4-day build — it gives you working, wired end-to-end plumbing (auth incl. OTP, property + checklist, tenancy activation, letter generation → endorsement → send) so the remaining work is UI polish and the pages this doc didn't have time to build:
- Landlord "manage applications" view (accept/reject) and "respond to reports" view
- Admin notifications, activity monitoring, flagged-listing actions
- File/image upload for property photos (currently a plain `String[]` of URLs — no upload endpoint wired up)
- Search/filter UI on the public listings page (the API in `/api/properties` already supports `minPrice`, `maxPrice`, `minSafetyScore`, `city`, `q` — just needs a form)
- Rate limiting on `/api/auth/*` (brute-force protection beyond the OTP attempt cap)
- Tests

## Architecture notes

- **Neon adapter is required, not optional**, if this deploys to Vercel — a plain TCP Prisma client opens a new Postgres connection per serverless invocation and will exhaust Neon's connection limit under real traffic. `src/lib/prisma.ts` is already wired for it.
- **Sessions are a signed JWT in an httpOnly cookie**, not a DB-backed session table. Fine for a 4-day MVP; if you need server-side revocation (e.g. "log out everywhere"), that needs a sessions table later.
- **OTP codes are stored bcrypt-hashed**, same as passwords — never plaintext, even temporarily.
