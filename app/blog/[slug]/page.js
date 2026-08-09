import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import NextLink from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { connectDB } from "@/lib/db";
import BlogPost from "@/lib/models/BlogPost";

export const dynamic = "force-dynamic";

async function getPost(slug) {
  await connectDB();
  const post = await BlogPost.findOne({ slug, status: "published" }).lean();
  return post ? JSON.parse(JSON.stringify(post)) : null;
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: "Post not found — Routely" };
  return {
    title: `${post.title} — Routely`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || "",
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export default async function BlogDetailPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const date = post.publishedAt || post.createdAt;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-5 md:px-8 py-14 md:py-20">
        <NextLink href="/blog" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-900 mb-8 transition-colors">
          <ArrowLeft size={14} /> Back to blog
        </NextLink>

        {post.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featuredImage} alt="" className="w-full aspect-[16/8] object-cover rounded-2xl mb-8" />
        )}

        <p className="text-xs text-ink-400 mb-3">
          {post.author} ·{" "}
          {date && new Date(date).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-ink-900 tracking-tight leading-tight mb-8">
          {post.title}
        </h1>

        <div className="prose-blog">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </main>
      <Footer />
    </>
  );
}
