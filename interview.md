# interview.md — Talking through Routely with confidence

This is your prep doc, not part of the submission. It's organized so you can
skim it 10 minutes before a call: elevator pitch → architecture walkthrough →
the decisions you'll be asked to defend → likely questions with answers →
honest limitations. Everything here is true to what's actually in the code —
nothing to memorize that isn't real.

---

## 1. Thirty-second pitch

"It's a smart link router — one short link that redirects iOS visitors to
the App Store, Android visitors to Play Store, and everyone else to a
fallback web page, based on parsing the User-Agent header server-side. Every
click gets logged asynchronously so it doesn't slow down the redirect, and
there's a small dashboard with per-link analytics — time-series clicks,
platform split, referrers. I also built a Markdown blog CMS into the same
admin, since the brief asked for it. It's a single Next.js 14 app — the API
routes are the backend, cleanly separated from the pages, talking to
MongoDB through Mongoose."

---

## 2. Architecture walkthrough

### Why one Next.js app instead of a separate Express server?

The brief explicitly allowed "Next.js API routes if cleanly
architecture-separated." I took that option because:
- It's one process to run and deploy, which matters more for a 48-hour
  assessment than for a real product.
- Route Handlers (`app/api/**/route.js`) *are* a real backend layer — they're
  not page code. All business logic (validation, DB queries, auth checks)
  lives in `lib/` and `app/api/`, and none of it leaks into React components.
  A page component never imports Mongoose directly except in two spots
  (`app/blog/page.js` and `app/blog/[slug]/page.js`), and I can defend that
  specifically (see Q&A below).
- If I were building this as a product with a mobile app client too, I'd
  peel the `app/api/**` folder out into a standalone Express/Nest service
  with almost no rewriting — the route handlers are already thin wrappers
  around `lib/` functions.

### The three-layer split

```
lib/          → DB connection, auth, Mongoose models (the "domain" layer)
app/api/**    → HTTP layer: parse request, call lib/, shape response
app/**/page.js → UI layer: fetch from app/api or, for a couple of
                 server-rendered public pages, query lib/ directly
```

### Why does `app/blog/page.js` query MongoDB directly instead of calling `/api/public/blog`?

Because it's a React Server Component running on the server already — going
`page → fetch → API route → lib/db → Mongoose` is a network round-trip to
itself for no benefit. I still built the `/api/public/blog` REST endpoints
because the brief asks for a proper public blog *API surface* too (and
they're what a future mobile client would use), but the server-rendered page
itself calls `lib/` directly, which is the idiomatic Next.js App Router
pattern. I can point to this file specifically if asked "wait, doesn't this
break your separation rule?" — it's a deliberate, defensible exception, not
an oversight.

### Data model

**`Link`** — `alias` (unique, indexed), `title`, `iosUrl`, `androidUrl`,
`fallbackUrl`, `active`, `clickCount` (denormalized counter, incremented on
every click so the links table doesn't need a COUNT aggregation just to
render).

**`ClickEvent`** — `link` (ref), `alias` (denormalized — lets me query by
alias without a join if I ever need to), `platform` (enum: ios/android/
desktop), `ip`, `country`, `referrer`, `userAgent`, `destination`,
`createdAt`. Compound index on `{ link: 1, createdAt: -1 }` since every
analytics query filters by link and sorts by time.

**`BlogPost`** — `title`, `slug` (unique, indexed), `content` (raw
Markdown, rendered client- and server-side with `react-markdown`), `status`
(draft/published), `publishedAt`. Publishing sets `publishedAt`; unpublishing
clears it — that's what the public queries filter on.

### The redirect engine (`app/l/[alias]/route.js`)

1. Look up the link by alias (`active: true` filter — paused links 404 to
   `/link-not-found` instead of redirecting).
2. Parse `User-Agent` with `ua-parser-js`, read `os.name`, bucket it into
   `ios` / `android` / `desktop`.
3. Pick the destination: platform-specific URL if set, else `fallbackUrl`.
4. Fire off the click-logging write **without awaiting it**, then return the
   `302` redirect immediately. The write (a `ClickEvent.create` +
   `Link.updateOne` `$inc`) happens after the response is already on the
   wire.
5. Any failure (bad alias, DB hiccup) falls back to redirecting to
   `/link-not-found` rather than throwing a 500 at a real visitor.

### Auth

Single admin account, credentials in `.env.local` (`ADMIN_EMAIL` /
`ADMIN_PASSWORD`), compared directly against the login payload. On success I
sign a JWT with `jose` and set it as an `httpOnly`, `sameSite=lax` cookie.
`middleware.js` (runs on the Edge runtime) verifies that cookie on every
request to `/admin/**` (except `/admin/login`) and every request to
`/api/links/**`, `/api/blog/**`, `/api/stats/**` — API calls without a valid
cookie get a `401` JSON response; page loads get redirected to
`/admin/login?from=<path>` so they land back where they wanted after signing
in.

I specifically used **`jose`** instead of the more common `jsonwebtoken`
package for this, because `jsonwebtoken` depends on Node's native `crypto`
module, which the **Edge runtime middleware can't use**. `jose` is built on
Web Crypto, so the exact same `signToken`/`verifyToken` functions in
`lib/auth.js` work in both the Node-runtime API routes and the Edge-runtime
middleware. This one is worth knowing cold — it's the kind of thing that
looks like a small detail but is actually "did you understand how Next.js
middleware execution works" in disguise.

---

## 3. Decisions you'll be asked to defend

**"Why not bcrypt-hash the admin password?"**
Because there's exactly one admin account and no signup flow — the password
lives in an environment variable, not a database row, so there's nothing for
a hash to protect against (an attacker who can read `.env.local` can already
read the plaintext env var *or* a hash + verify function sitting right next
to it). If this grew into multi-admin, I'd move credentials into a `User`
collection with bcrypt hashing immediately — that's a well-understood,
small change. I'd rather be upfront that this is a conscious scope decision
than pretend it's not a trade-off.

**"Why fire-and-forget the click write instead of awaiting it?"**
Because the product goal is "redirect fast" — the brief explicitly asks for
this ("without slowing down redirection time"). Awaiting a DB write adds
real latency (even 20-50ms matters when someone's tapping a link expecting
an app store to open instantly). The trade-off is that if the process were
killed the instant after the response is sent, that one click wouldn't be
recorded — acceptable for a redirect analytics use case, not acceptable for
something like a payment. I'd talk about `waitUntil`/background job
queues (SQS, BullMQ) as the production-grade version of this if it needs to
survive serverless cold shutdowns — this app runs as a long-lived Node
process (`next start`), so the fire-and-forget promise reliably finishes
before the process would ever exit.

**"Why MongoDB over Postgres, given the brief allowed either?"**
Click events are a write-heavy, schema-flexible, append-only log — a
natural fit for a document store, and the analytics I need (group by
platform, group by day) map cleanly onto Mongo's aggregation pipeline
without needing joins. If I needed strong relational guarantees (e.g.
billing, multi-tenant permissions), I'd lean Postgres instead — this was a
judgment call based on the actual access patterns, not a default.

**"Why store `alias` denormalized on `ClickEvent` when you already have `link`?"**
Small, deliberate denormalization: it lets me query/debug click history by
alias directly (e.g., in Mongo shell) without a `$lookup`, and it survives
even if a link document were ever deleted (though in practice I cascade-
delete click events when a link is deleted, in `DELETE /api/links/[id]`).

**"Why a route group `(shell)` under `/admin`?"**
So `/admin/login` can render without the authenticated sidebar chrome,
while every other `/admin/*` route shares one layout (sidebar, session
check, logout). Route groups in the App Router don't affect the URL — `
(shell)` is invisible in the path — they only affect which `layout.js`
wraps which pages. It's a clean way to say "this one page opts out of the
shell" without duplicating the shell's fetch-session logic on every page.

**"Why does `middleware.js` protect `/api/stats` too, when it's not obviously admin data?"**
Because the dashboard stats endpoint aggregates click counts and top links
across *all* links, including inactive/paused ones and ones the admin might
not want surfaced publicly — it's operational data about the whole account,
not public content, so it gets the same gate as `/api/links` and
`/api/blog`.

---

## 4. Anticipated questions & answers

**Q: Walk me through what happens end-to-end when someone taps a short link on their iPhone.**
A: Request hits `GET /l/[alias]`. I look up the `Link` by alias (must be
`active`). I parse the `User-Agent` header with `ua-parser-js`; if
`os.name === "ios"` (or it's an iPad reporting `Mac OS` with a `Mobile`
token in the UA — that's a real edge case I handled explicitly), I pick
`iosUrl`, falling back to `fallbackUrl` if it's empty. I kick off an
un-awaited `Promise.all` that writes a `ClickEvent` and increments the
link's `clickCount`, then immediately return a `302` to the chosen URL. The
browser follows the redirect; the DB write finishes a moment later in the
background.

**Q: How do you detect country without a GeoIP database?**
A: I read `x-vercel-ip-country`, which Vercel's edge network populates
automatically when deployed there. Locally / off-Vercel it's absent, so I
default to `"Unknown"`. If I needed this to work everywhere, I'd integrate a
GeoIP lookup service (MaxMind, ipapi) keyed off the client IP I'm already
capturing from `x-forwarded-for`.

**Q: What happens if two different links have the same alias?**
A: Can't happen — `alias` has a `unique: true` index at the schema level,
and I also do an explicit `findOne` check before insert in the API route so
I can return a friendly `409` with a field-level error message instead of a
raw Mongo duplicate-key exception bubbling up.

**Q: How would this scale if a link went viral — 10,000 clicks in a minute?**
A: The redirect path itself is nearly free (one indexed `findOne`, no
awaited write), so it scales with however many Node processes you run
horizontally. The write path (`ClickEvent.create`) is the part that would
need attention at real scale — I'd batch writes or push them onto a queue
(SQS/Kafka/BullMQ, which — fun fact — I've built toy versions of in my own
interview-prep repos) instead of one Mongo insert per click, and consider
sharding `ClickEvent` by `link` or by time.

**Q: Why does the analytics endpoint fill in zero-count days instead of just returning what's in the DB?**
A: So the chart never has gaps that could be misread as "no data available"
vs. "genuinely zero clicks that day." I build the full date range up front
in JS (`for` loop from `since` to today) and merge in whatever counts came
back from the aggregation, defaulting missing days to `0`.

**Q: Your `detectPlatform` function has a specific iPadOS branch — why?**
A: Since iPadOS 13, Safari on iPad reports its OS as `"Mac OS"` in the
User-Agent by default (Apple did this on purpose, for desktop-site
compatibility), which would otherwise misclassify every iPad visitor as
desktop. The one reliable signal left is the `Mobile` token still present in
the UA string on a real iPad. I check for that combination explicitly and
still route it to `iosUrl`. It's a good example of a UA-parsing edge case
that's easy to miss and easy to explain once you've hit it.

**Q: How do drafts stay hidden from the public blog?**
A: Every public-facing query — both `/api/public/blog` and the
server-rendered `/blog` and `/blog/[slug]` pages — filters
`{ status: "published" }` at the database level. There's no client-side
hiding of drafts; an unpublished post simply isn't in the result set, and a
direct visit to a draft's URL 404s via Next's `notFound()`.

**Q: What would you change if you had another week?**
A: Real GeoIP instead of the Vercel header, a queue in front of click
writes, multi-admin accounts with bcrypt + roles, pagination on the admin
links/blog tables (currently unpaginated — fine at demo scale, not at
10,000 links), and server-side rate limiting on `/api/auth/login` to slow
down brute-force attempts.

---

## 5. Known, honest limitations (say these before you're asked)

- Single hardcoded admin account, no user management — a deliberate scope
  cut for the assessment window, discussed above.
- No pagination on the admin Links/Blog tables (the *public* blog listing
  *is* paginated). Would add `skip`/`limit` + a page control identically to
  how `/api/public/blog` already works.
- Country detection depends on `x-vercel-ip-country`; it's `"Unknown"` in
  any environment that doesn't set that header (e.g. plain `next start`
  locally).
- Click logging is fire-and-forget — correct for the stated goal ("don't
  slow down redirection"), but means a click in the same instant as a
  process crash could be lost. Acceptable for analytics; I'd design
  differently for anything billing-adjacent.
- No automated tests. Given more time I'd add integration tests around the
  redirect engine's platform-detection branches (that's the highest-risk
  logic in the app) and the auth middleware's allow/deny matrix.
