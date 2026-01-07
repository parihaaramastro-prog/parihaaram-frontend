
"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

interface Testimonial {
    id: number;
    name: string;
    role: string;
    company: string;
    content: string;
    image: string;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        name: "Arjun Mehta",
        role: "Senior Analyst",
        company: "FinTech Corp",
        content: "I used to be skeptical, but the precision of the career analysis was uncanny. It helped me time my promotion request perfectly.",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100"
    },
    {
        id: 2,
        name: "Priya Sharma",
        role: "Product Manager",
        company: "StartUp Inc",
        content: "The daily insights help me navigate team dynamics better. It's like having a secret strategy guide for my corporate life.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fit=crop&w=100&h=100"
    },
    {
        id: 3,
        name: "Rahul Verma",
        role: "Founder",
        company: "TechSolutions",
        content: "Pariharam's compatibility charts were a game-changer for finding my co-founder. Highly recommended for serious professionals.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=100&h=100"
    },
    {
        id: 4,
        name: "Sneha Patel",
        role: "HR Director",
        company: "Global Systems",
        content: "I love the clean, no-nonsense interface. It gives me the data I need without the mystical fluff. Pure, actionable insights.",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?fit=crop&w=100&h=100"
    }
];

export default function Testimonials() {
    return (
        <section className="py-24 bg-slate-50 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16 space-y-4">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] bg-white px-3 py-1 rounded-full border border-indigo-100 shadow-sm"
                    >
                        Success Stories
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
                    >
                        Loved by Modern Professionals
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-lg text-slate-600 font-medium"
                    >
                        Join thousands of forward-thinking individuals who use astrology as a strategic tool for life and career.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between h-full"
                        >
                            <div className="space-y-4">
                                <div className="text-indigo-500">
                                    <Quote className="w-8 h-8 opacity-20" />
                                </div>
                                <p className="text-slate-700 font-medium leading-relaxed italic">
                                    "{testimonial.content}"
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-3 border-t border-slate-50 pt-4">
                                <img
                                    src={testimonial.image}
                                    alt={testimonial.name}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-50"
                                />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">{testimonial.name}</h4>
                                    <p className="text-[10px] uppercase tracking-wide text-slate-500 font-semibold">{testimonial.role}</p>
                                    <p className="text-[10px] text-indigo-600 font-medium">{testimonial.company}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
