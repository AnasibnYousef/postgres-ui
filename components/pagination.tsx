'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';


export default function Pagination({
    tableName,
    pagination,
}: {
    tableName: string;
    pagination: { currentPage: number; pageSize: number; totalPages: number; totalRows: number };
}) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('page', newPage.toString());
        router.push(`/tables/${tableName}?${params.toString()}`);
    };

    return (
        <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
                Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalRows)} of{' '}
                {pagination.totalRows} results
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === 1}
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.currentPage === pagination.totalPages}
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
