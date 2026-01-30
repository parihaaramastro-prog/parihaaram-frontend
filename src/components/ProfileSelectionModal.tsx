"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SavedHoroscopes from "./SavedHoroscopes";
import { SavedHoroscope } from "@/lib/services/horoscope";
import Link from "next/link";

interface ProfileSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (profile: SavedHoroscope) => void;
    title?: string;
}

export default function ProfileSelectionModal({ isOpen, onClose, onSelect, title = "Select Profile" }: ProfileSelectionModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent body scroll when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col z-10"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
                    <h2 className="text-xl font-bold text-slate-900">{title}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200">
                    <SavedHoroscopes onSelect={(h) => { onSelect(h); onClose(); }} />

                    <div className="mt-8 pt-6 border-t border-dashed border-slate-200 text-center">
                        <Link
                            href="/horoscope/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold text-sm hover:bg-indigo-100 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Create New Profile
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>,
        document.body
    );
}
