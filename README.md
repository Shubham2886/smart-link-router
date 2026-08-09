# Routely — Smart Link Router & Blog CMS

One short link, routed differently per platform (iOS App Store / Google Play
/ desktop fallback), with real-time click analytics and a Markdown blog CMS.

**Stack:** Next.js 14 (App Router, Route Handlers as the backend), MongoDB /
Mongoose, Tailwind CSS, JWT auth (`jose`), Recharts.

This is a single Next.js app. The backend is implemented as Next.js **Route
Handlers** under `app/api/**` — a cleanly separated backend layer (models,
auth, DB connection all live in `lib/`), not mixed into page components.

## 1. Prerequisites

- **Node.js 18.18+** (Node 20 LTS recommended)
- **MongoDB** — either:
  - Local: `mongodb://127.0.0.1:27017/smart-link-router`, or
  - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) free tier (recommended if you don't have Mongo installed locally)

Check your Node version:
```bash
node -v
```

## 2. Environment variables

Copy the example file and fill in your own values:
```bash
cp .env.example .env.local
```

`.env.local`:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/smart-link-router
JWT_SECRET=replace-with-a-long-random-string
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=changeme123
```

- `MONGODB_URI` — your local or Atlas connection string.
- `JWT_SECRET` — any long random string, used to sign the admin session cookie.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — the single admin account used to log
  into `/admin`.

## 3. Install & run

```bash
npm install
npm run dev
```

The app runs on **http://localhost:3000**.

For a production-style run instead:
```bash
npm run build
npm run start
```

## 4. Seed sample data (recommended)

A seed script creates 3 sample smart links, 3 sample blog posts (2 published,
1 draft), and ~2 weeks of realistic click history so the dashboard charts
aren't empty on first look:

```bash
npm run seed
```

This **wipes and repopulates** the `Link`, `ClickEvent`, and `BlogPost`
collections in whatever database `MONGODB_URI` points to. Safe to re-run any
time.

## 5. Testing walkthrough

### Log into the admin panel
1. Go to `http://localhost:3000/admin` — you'll be redirected to `/admin/login`.
2. Sign in with the `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`.
3. You'll land on the dashboard with KPI cards, a 7-day click chart, platform
   split, top links, and recent activity.

### Create a smart link
1. Go to **Links → New link**.
2. Fill in a title, an alias (e.g. `myapp`), and at least the fallback URL.
   iOS and Android URLs are optional — if left blank, that platform also
   falls back to the fallback URL.
3. Save. You'll see it in the links table with a **Copy** button for the
   short URL (`http://localhost:3000/l/myapp`) and an **open** icon to test it directly.

### Simulate different platforms
The redirection engine reads the `User-Agent` header, so you can simulate
each platform two ways:

**A. Chrome DevTools (recommended)**
1. Open the short link in Chrome, e.g. `http://localhost:3000/l/myapp`.
2. Open DevTools → the three-dot menu → **More tools → Network conditions**.
3. Under **User agent**, uncheck "Use browser default" and pick an iPhone or
   Android entry (or paste a custom UA string).
4. Reload the short link — it now redirects to the iOS/Android destination
   instead of the fallback.

**B. curl (fastest for a quick check)**
```bash
# iOS
curl -I -A "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)" http://localhost:3000/l/myapp

# Android
curl -I -A "Mozilla/5.0 (Linux; Android 14)" http://localhost:3000/l/myapp

# Desktop (default curl UA already looks like "Other")
curl -I http://localhost:3000/l/myapp
```
Look at the `location:` header in the response — it should point to the
matching destination.

### Check analytics
1. After a few test clicks (from step above), open **Links** in the admin,
   click the pencil icon on your link.
2. The right-hand panel shows total clicks, platform split, a 14-day bar
   chart, and a table of recent click events (timestamp, country, platform).
3. The main **Dashboard** page aggregates this across all links.

### Create and verify a blog post
1. Go to **Blog → New post**.
2. Write a title (the slug auto-fills), some Markdown content — the panel on
   the right live-previews it.
3. Click **Publish**.
4. Open `http://localhost:3000/blog` in a new tab — the post appears in the
   card grid immediately (no rebuild needed, it's server-rendered on request).
5. Click into it — `http://localhost:3000/blog/<your-slug>` renders the full
   Markdown content with proper typography.
6. Back in the admin, try **Save as draft** on another post — drafts do
   *not* appear on the public `/blog` listing or detail page (they 404 if
   visited directly while in draft status).

### Sign out
Use **Log out** in the sidebar — it clears the session cookie and you'll be
bounced back to `/admin/login` if you try to revisit `/admin`.

## 6. Project structure

```
app/
  page.js                     Public landing page
  blog/                       Public blog (listing + detail, server-rendered)
  link-not-found/             Friendly page for dead/paused short links
  l/[alias]/route.js          The redirect engine (GET → 302)
  admin/
    login/                    Public login page
    (shell)/                  Route group: everything behind the sidebar shell
      page.js                 Dashboard
      links/                  Link list, create, edit + analytics
      blog/                   Post list, create, edit
  api/
    auth/                     login / logout / me
    links/                    Admin-only CRUD + analytics (protected by middleware.js)
    blog/                     Admin-only CRUD (protected by middleware.js)
    public/blog/              Public read-only endpoints (published posts only)
    stats/                    Admin dashboard aggregate stats
lib/
  db.js                       Cached Mongoose connection
  auth.js                     JWT sign/verify (jose — edge-runtime safe)
  models/                     Link, ClickEvent, BlogPost (Mongoose schemas)
middleware.js                  Route-level auth guard (admin pages + admin API)
components/                    Shared UI (forms, tables, charts, toasts, etc.)
scripts/seed.js                Sample data seeder
```

## 7. Troubleshooting

- **"Failed to load links" / 500 errors in admin** — `MONGODB_URI` is
  probably wrong or MongoDB isn't running. Check `.env.local`.
- **Login always fails** — double check `ADMIN_EMAIL` / `ADMIN_PASSWORD` in
  `.env.local` match exactly what you're typing.
- **Redirect always goes to the fallback URL** — that's correct if the
  iOS/Android field was left blank for that link; fallback is the safety net
  by design.