import { SportDashboard } from "./SportDashboard";
import { SPORTS_CONFIG } from "@/lib/sports";

// This is a Server Component that handles route parameters
export default async function SportPortalPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    return <SportDashboard category={category} />;
}

// Generate static params for all defined sports to support static export if needed
export async function generateStaticParams() {
    return Object.keys(SPORTS_CONFIG).map((category) => ({
        category,
    }));
}
