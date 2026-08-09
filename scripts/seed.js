/**
 * Seed script — populates the database with sample data so the app is
 * immediately explorable after setup.
 *
 * Usage:  npm run seed
 * Requires MONGODB_URI to be set in .env.local
 */
require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");

const LinkSchema = new mongoose.Schema(
  {
    alias: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: String,
    iosUrl: String,
    androidUrl: String,
    fallbackUrl: String,
    active: { type: Boolean, default: true },
    clickCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const ClickEventSchema = new mongoose.Schema(
  {
    link: { type: mongoose.Schema.Types.ObjectId, ref: "Link" },
    alias: String,
    platform: { type: String, enum: ["ios", "android", "desktop"] },
    ip: String,
    country: String,
    referrer: String,
    userAgent: String,
    destination: String,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const BlogPostSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true, lowercase: true },
    featuredImage: String,
    author: String,
    excerpt: String,
    content: String,
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    publishedAt: Date,
  },
  { timestamps: true }
);

const Link = mongoose.model("Link", LinkSchema);
const ClickEvent = mongoose.model("ClickEvent", ClickEventSchema);
const BlogPost = mongoose.model("BlogPost", BlogPostSchema);

const SAMPLE_LINKS = [
  {
    alias: "shopnow",
    title: "ShopNow — Get the app",
    iosUrl: "https://apps.apple.com/app/id123456789",
    androidUrl: "https://play.google.com/store/apps/details?id=com.shopnow",
    fallbackUrl: "https://example.com/shopnow",
    active: true,
  },
  {
    alias: "fitTrack",
    title: "FitTrack Fitness App",
    iosUrl: "https://apps.apple.com/app/id987654321",
    androidUrl: "",
    fallbackUrl: "https://example.com/fittrack",
    active: true,
  },
  {
    alias: "webinar",
    title: "Product Launch Webinar",
    iosUrl: "",
    androidUrl: "",
    fallbackUrl: "https://example.com/webinar-signup",
    active: true,
  },
];

const SAMPLE_POSTS = [
  {
    title: "Why smart link routing beats plain URL shorteners",
    slug: "why-smart-link-routing-wins",
    author: "Team Routely",
    excerpt: "A plain short link sends everyone to the same place. Here's why that costs you installs.",
    status: "published",
    featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    content: `## The problem with one destination\n\nMost link shorteners send every visitor to the same URL, regardless of device. That means an iPhone user tapping an "install our app" link often lands on a generic web page instead of the App Store.\n\n## Route by platform instead\n\nA smart link inspects the visitor's device before deciding where to send them:\n\n- **iOS** visitors go straight to the App Store listing\n- **Android** visitors go to Google Play\n- **Everyone else** lands on a fallback web page\n\nThis single change can noticeably improve install conversion, because it removes an extra tap and a moment of confusion from the funnel.\n\n> The best redirect is the one the visitor never has to think about.\n\n## What to measure\n\nOnce routing is in place, the next question is *which platform is actually converting*. That's where per-link analytics — click counts, platform split, and referrer breakdown — start to matter.`,
  },
  {
    title: "Reading your click analytics without getting lost in the noise",
    slug: "reading-click-analytics",
    author: "Team Routely",
    excerpt: "Total clicks is a vanity metric. Here's what to actually look at first.",
    status: "published",
    featuredImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
    content: `## Start with platform split, not totals\n\nA link with 10,000 clicks and no Android traffic tells a very different story than one split evenly across iOS, Android, and desktop. Platform split is usually the first chart worth reading.\n\n## Then look at the trend, not the total\n\nA flat trend after a campaign email usually means the campaign's momentum has faded — worth knowing before you plan the next one.\n\n## Referrers close the loop\n\nIf most clicks show \`direct\` as the referrer, your link is probably being shared in a place that strips referrer headers, like some messaging apps. That's normal, not a bug.`,
  },
  {
    title: "Draft: upcoming CMS improvements",
    slug: "upcoming-cms-improvements",
    author: "Team Routely",
    excerpt: "A few ideas we're considering for the blog editor.",
    status: "draft",
    featuredImage: "",
    content: `## Ideas on the table\n\n- Scheduled publishing\n- Tags and categories\n- Inline image uploads\n\nNothing here is final yet — this post isn't public.`,
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not set. Add it to .env.local first.");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB.");

  await Promise.all([Link.deleteMany({}), ClickEvent.deleteMany({}), BlogPost.deleteMany({})]);
  console.log("Cleared existing links, click events, and posts.");

  const links = await Link.insertMany(SAMPLE_LINKS.map((l) => ({ ...l, alias: l.alias.toLowerCase() })));
  console.log(`Inserted ${links.length} sample links.`);

  const posts = await BlogPost.insertMany(
    SAMPLE_POSTS.map((p) => ({ ...p, publishedAt: p.status === "published" ? new Date() : null }))
  );
  console.log(`Inserted ${posts.length} sample blog posts (${posts.filter((p) => p.status === "published").length} published).`);

  // Generate ~2 weeks of fake click history so the dashboard charts aren't empty.
  const platforms = ["ios", "android", "desktop"];
  const countries = ["United States", "India", "United Kingdom", "Germany", "Brazil"];
  const referrers = ["direct", "https://twitter.com", "https://instagram.com", "https://newsletter.example.com"];
  const events = [];

  for (const link of links) {
    const clicksToCreate = 15 + Math.floor(Math.random() * 40);
    for (let i = 0; i < clicksToCreate; i++) {
      const daysAgo = Math.floor(Math.random() * 14);
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));

      const platform = platforms[Math.floor(Math.random() * platforms.length)];
      events.push({
        link: link._id,
        alias: link.alias,
        platform,
        ip: "203.0.113." + Math.floor(Math.random() * 255),
        country: countries[Math.floor(Math.random() * countries.length)],
        referrer: referrers[Math.floor(Math.random() * referrers.length)],
        userAgent: "SeedScript/1.0",
        destination: link.fallbackUrl,
        createdAt,
      });
    }
    await Link.updateOne({ _id: link._id }, { $set: { clickCount: clicksToCreate } });
  }

  await ClickEvent.insertMany(events);
  console.log(`Inserted ${events.length} sample click events.`);

  console.log("\nSeed complete. Admin login uses the ADMIN_EMAIL / ADMIN_PASSWORD from .env.local.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
