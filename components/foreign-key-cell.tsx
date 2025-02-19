'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ForeignKeyCell({
    value,
    foreignKey,
    currentTable,
}: {
    value: string | number | null;
    foreignKey: { referenced_table: string; referenced_column: string } | undefined;
    currentTable: string;
}) {
    const searchParams = useSearchParams();

    if (!foreignKey || value === null) {
        return <span>{value?.toString() || ''}</span>;
    }

    // ✅ Prevent navigation if the referenced table is the current table
    if (foreignKey.referenced_table === currentTable) {
        return <span className="text-gray-500">{value}</span>; // Show as plain text
    }

    // ✅ Correctly append the current table to breadcrumbs, avoiding duplication
    const existingBreadcrumbs = searchParams.get('breadcrumbs') || '';
    const breadcrumbList = existingBreadcrumbs ? existingBreadcrumbs.split('|') : [];
    const updatedBreadcrumbs = breadcrumbList.includes(currentTable)
        ? existingBreadcrumbs
        : [...breadcrumbList, currentTable].join('|');

    return (
        <Link
            href={`/tables/${foreignKey.referenced_table}?${foreignKey.referenced_column}=${value}&breadcrumbs=${encodeURIComponent(updatedBreadcrumbs)}`}
        >
            <span className="text-blue-600 underline cursor-pointer">{value}</span>
        </Link>
    );
}
