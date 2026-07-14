import type { Metadata } from "next";
import AdminSidebar from "@/components/AdminSidebar";

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
        <div className="flex min-h-screen bg-[#fcfaf5] font-sans overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 relative overflow-y-auto">
                {children}
            </div>
        </div>
    )
}