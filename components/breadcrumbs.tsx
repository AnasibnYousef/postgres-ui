'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumbs({ currentTable }: { currentTable: string }) {
    const searchParams = useSearchParams();

    // ✅ Get the existing breadcrumbs from the URL
    const existingBreadcrumbs = searchParams.get('breadcrumbs') || '';
    const breadcrumbList = existingBreadcrumbs ? existingBreadcrumbs.split('|') : [];

    return (
        <nav className="mb-4 text-sm text-gray-600">
            <span>History: </span>
            {breadcrumbList.map((table, index) => {
                // ✅ Build breadcrumb URL while keeping only the necessary history
                const breadcrumbPath = `/tables/${table}?breadcrumbs=${encodeURIComponent(
                    breadcrumbList.slice(0, index).join('|')
                )}`;

                return (
                    <span key={index} className="inline-flex items-center">
                        <Link href={breadcrumbPath} className="text-blue-600 hover:underline">
                            {table}
                        </Link>
                        <ChevronRight className="mx-2 h-4 w-4" />
                    </span>
                );
            })}
            {/* ✅ Show the current table (not clickable) */}
            <span className="inline-flex items-center text-gray-400">
                {currentTable}
            </span>
        </nav>
    );
}
