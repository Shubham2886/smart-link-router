import NextLink from "next/link";

export default function BlogCard({ post }) {
  const date = post.publishedAt || post.createdAt;
  return (
    <NextLink
      href={`/blog/${post.slug}`}
      className="group rounded-2xl border border-ink-100 bg-paper-100 shadow-panel overflow-hidden hover:shadow-lift hover:-translate-y-0.5 transition-all"
    >
      <div className="aspect-[16/9] bg-ink-100 overflow-hidden">
        {post.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-ink-100 to-paper-300">
            <span className="font-display text-3xl text-ink-300">
              {post.title?.[0]?.toUpperCase() || "R"}
            </span>
          </div>
        )}
      </div>
      <div className="p-5">
        <p className="text-xs text-ink-400 mb-2">
          {post.author} · {date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : ""}
        </p>
        <h3 className="font-display font-semibold text-ink-900 leading-snug mb-2 group-hover:text-signal-600 transition-colors">
          {post.title}
        </h3>
        {post.excerpt && <p className="text-sm text-ink-500 leading-relaxed line-clamp-2">{post.excerpt}</p>}
      </div>
    </NextLink>
  );
}
