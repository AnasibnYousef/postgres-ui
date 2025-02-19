import pool from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import Link from 'next/link';
import Filters from '@/components/filters';
import ForeignKeyCell from '@/components/foreign-key-cell';
import Pagination from '@/components/pagination';
import Breadcrumbs from '@/components/breadcrumbs';
import { Metadata } from 'next';

async function getTableData(tableName: string, searchParams: URLSearchParams) {
    try {
        const page = parseInt(searchParams.get('page') || '1', 10);
        const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
        const offset = (page - 1) * pageSize;
        if (!/^[a-zA-Z0-9_]+$/.test(tableName)) {
            throw new Error('Invalid table name');
        }

        const columnsQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = $1
        `;
        const { rows: columns } = await pool.query(columnsQuery, [tableName]);

        const foreignKeysQuery = `
            SELECT
                kcu.column_name AS column,
                ccu.table_name AS referenced_table,
                ccu.column_name AS referenced_column
            FROM information_schema.key_column_usage AS kcu
            JOIN information_schema.constraint_column_usage AS ccu
                ON kcu.constraint_name = ccu.constraint_name
            WHERE kcu.table_name = $1
        `;
        const { rows: foreignKeys } = await pool.query(foreignKeysQuery, [tableName]);

        const filterConditions: string[] = [];
        const filterValues: string[] = [];

        columns.forEach((col) => {
            const value = searchParams.get(col.column_name);
            if (value) {
                filterConditions.push(`${col.column_name}::text ILIKE $${filterValues.length + 1}`);
                filterValues.push(`%${value}%`);
            }
        });

        const whereClause = filterConditions.length > 0 ? `WHERE ${filterConditions.join(' AND ')}` : '';

        if (pageSize <= 0 || offset < 0) {
            throw new Error('Invalid pagination values');
        }

        const dataQuery = `
            SELECT * FROM ${tableName}
            ${whereClause}
            LIMIT $${filterValues.length + 1} OFFSET $${filterValues.length + 2}
        `;
        const { rows: data } = await pool.query(dataQuery, [...filterValues, pageSize, offset]);

        const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
        const { rows: countResult } = await pool.query(countQuery, filterValues);
        const totalRows = parseInt(countResult[0]?.count || '0', 10);
        const totalPages = Math.ceil(totalRows / pageSize);

        return {
            columns,
            foreignKeys,
            data,
            pagination: { currentPage: page, pageSize, totalPages, totalRows },
        };
    } catch (error) {
        console.error('Error fetching table data:', error);
        return { columns: [], foreignKeys: [], data: [], pagination: null, error: 'Failed to load data' };
    }
}

type TableViewParams = { tableName: string };

export async function generateMetadata(
    { params }: { params: Promise<TableViewParams> },
): Promise<Metadata> {
    const { tableName } = await params;
    return {
        title: `Table: ${tableName}`,
    };
}


export default async function TableView({
    params,
    searchParams,
}: {
    params: Promise<TableViewParams>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {

    const tableName = (await params).tableName;
    const search_params = await searchParams
    const queryParams = new URLSearchParams(
        Object.entries(search_params)
            .map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value ?? ''])
    );

    const { columns, foreignKeys, data, pagination, error } = await getTableData(tableName, queryParams);

    if (error) {
        return (
            <div className="p-6">
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <main className="p-6">
            <Card>
                <CardHeader>
                    <Breadcrumbs currentTable={tableName} />
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Database className="h-6 w-6" />
                            {tableName}
                        </CardTitle>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/">Back to Tables</Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Filters tableName={tableName} columns={columns} />
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableHead key={column.column_name}>{column.column_name}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="text-center text-gray-500">
                                        No data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                data.map((row, index) => (
                                    <TableRow key={index}>
                                        {columns.map((column) => (
                                            <TableCell key={column.column_name}>
                                                <ForeignKeyCell
                                                    value={row[column.column_name]}
                                                    foreignKey={foreignKeys.find(
                                                        (fk) => fk.column === column.column_name
                                                    )}
                                                    currentTable={tableName}
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {pagination && <Pagination tableName={tableName} pagination={pagination} />}
                </CardContent>
            </Card>
        </main>
    );
}
