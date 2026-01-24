"use client";

import Link from "next/link";
import { ArrowRight, Calendar, User, Clock } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-data";
import { motion } from "framer-motion";

export default function BlogList() {
    return (
        <div className="min-h-screen bg-slate-50 pt-0 pb-20">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 font-serif"
                    >
                        Insights & <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Wisdom</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600 leading-relaxed"
                    >
                        Explore the intersection of Vedic astrology, modern science, and spiritual philosophy.
                    </motion.p>
                </div>

                {/* Blog Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post, index) => (
                        <motion.div
                            key={post.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            className="group relative bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-500 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-violet-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="relative z-10 flex flex-col h-full">
                                {/* Meta */}
                                <div className="flex items-center gap-4 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{post.date}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{post.readTime}</span>
                                    </div>
                                </div>

                                {/* Content */}
                                <Link href={`/blog/${post.slug}`} className="block block group-hover:text-indigo-600 transition-colors">
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-indigo-600 transition-colors">
                                        {post.title}
                                    </h3>
                                </Link>

                                <p className="text-slate-600 mb-8 line-clamp-3 text-sm leading-relaxed">
                                    {post.excerpt}
                                </p>

                                {/* Footer */}
                                <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center">
                                            <User className="w-4 h-4 text-indigo-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{post.author}</span>
                                    </div>

                                    <Link
                                        href={`/blog/${post.slug}`}
                                        className="flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all"
                                    >
                                        Read
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
