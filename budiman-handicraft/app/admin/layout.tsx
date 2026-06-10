import type { Metadata } from "next";

export const metadata: Metadata = {
    title: 'Dashboard Admin',
    robots: {
        index: false,
        follow: false,
    },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <section className="min-h-screen bg-gray-50">
            {children}
        </section>
    )
}