import NextLink from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCard from "@/components/BlogCard";
import { connectDB } from "@/lib/db";
import BlogPost from "@/lib/models/BlogPost";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

async function getPosts(page) {
  await connectDB();
  const filter = { status: "published" };
  const [posts, total] = await Promise.all([
    BlogPost.find(filter)
      .select("title slug excerpt featuredImage author publishedAt createdAt")
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    BlogPost.countDocuments(filter),
  ]);
  return { posts: JSON.parse(JSON.stringify(posts)), pages: Math.max(Math.ceil(total / PAGE_SIZE), 1) };
}

export const metadata = { title: "Blog — Routely" };

export default async function BlogListPage({ searchParams }) {
  const page = Math.max(parseInt(searchParams?.page || "1", 10) || 1, 1);
  const { posts, pages } = await getPosts(page);

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight">The blog</h1>
        <p className="text-ink-500 mt-3 max-w-lg">Notes on links, routing, and everything in between.</p>

        {posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-ink-200 mt-12 p-16 text-center">
            <p className="text-ink-500">No posts published yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {posts.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-14">
            {Array.from({ length: pages }).map((_, i) => {
              const p = i + 1;
              return (
                <NextLink
                  key={p}
                  href={`/blog?page=${p}`}
                  className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-mono transition-colors ${
                    p === page ? "bg-ink-900 text-paper-100" : "text-ink-500 hover:bg-ink-100"
                  }`}
                >
                  {p}
                </NextLink>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
