
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import ShareButton from "@/components/ShareButton";
import TableOfContents from "@/components/blog/TableOfContents";
import BlogCTA from "@/components/blog/BlogCTA";
import { BLOG_POSTS } from "@/lib/blog-data";

import { Metadata } from "next";

// This is correct for Next.js 13+ App Router
export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

interface BlogPostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug);

    if (!post) {
        return {
            title: 'Post Not Found | Pariharam',
        };
    }

    return {
        title: `${post.title} | Pariharam Blog`,
        description: post.excerpt,
        keywords: post.tags,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            type: 'article',
            publishedTime: post.date,
            authors: [post.author],
            tags: post.tags,
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
        }
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { slug } = await params;
    const post = BLOG_POSTS.find((p) => p.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="min-h-screen bg-white pt-24 pb-20">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* Top Navigation */}
                <div className="mb-12">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase tracking-widest"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Insights
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* LEFT SIDEBAR: TOC */}
                    <div className="hidden lg:block lg:col-span-3">
                        <TableOfContents headings={post.headings || []} />
                    </div>

                    {/* CENTER CONTENT */}
                    <div className="lg:col-span-6">
                        {/* Header */}
                        <header className="mb-12">
                            <div className="flex flex-wrap items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>{post.date}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{post.readTime}</span>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600">
                                    {post.tags[0]}
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tight font-serif">
                                {post.title}
                            </h1>

                            <div className="flex items-center justify-between border-b border-t border-slate-100 py-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center border border-indigo-50">
                                        <User className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-900">{post.author}</p>
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Astrology Researcher</p>
                                    </div>
                                </div>
                                <ShareButton title={post.title} text={post.excerpt} />
                            </div>
                        </header>

                        {/* Main Content */}
                        <div className="prose prose-lg prose-slate max-w-none
                    prose-headings:font-bold prose-headings:text-slate-900 prose-headings:font-sans
                    prose-h2:text-3xl prose-h2:tracking-tight prose-h2:mt-12
                    prose-p:text-slate-600 prose-p:leading-relaxed
                    prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-slate-900 prose-strong:font-bold
                    prose-li:text-slate-600
                    prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-50/30 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                "
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Tags Footer */}
                        <div className="mt-16 pt-8 border-t border-slate-100">
                            <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wide border border-slate-100 hover:border-indigo-200 hover:text-indigo-600 transition-colors cursor-pointer">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR: CTA */}
                    <div className="lg:col-span-3">
                        <BlogCTA />
                    </div>

                </div>
            </div>
        </article>
    );
}
