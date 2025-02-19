'use client';

import { Input } from '@/components/ui/input';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Filters({ tableName, columns }: { tableName: string; columns: { column_name: string }[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleFilterChange = (column: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(column, value);
        } else {
            params.delete(column);
        }
        params.set('page', '1'); // Reset pagination on filter change
        router.push(`/tables/${tableName}?${params.toString()}`);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map((column) => (
                <div key={column.column_name}>
                    <Input
                        placeholder={`Filter ${column.column_name}...`}
                        defaultValue={searchParams.get(column.column_name) || ''}
                        onChange={(e) => handleFilterChange(column.column_name, e.target.value)}
                    />
                </div>
            ))}
        </div>
    );
}
