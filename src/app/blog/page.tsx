import { Metadata } from 'next';
import BlogList from "@/components/blog/BlogList";

export const metadata: Metadata = {
    title: "Astrology Insights & Wisdom | Pariharam Blog",
    description: "Explore the intersection of Vedic astrology, modern science, and spiritual philosophy with our expert articles and guides.",
    openGraph: {
        title: "Astrology Insights & Wisdom | Pariharam Blog",
        description: "Explore the intersection of Vedic astrology, modern science, and spiritual philosophy.",
        type: 'website',
    }
};

export default function BlogListingPage() {
    return <BlogList />;
}
