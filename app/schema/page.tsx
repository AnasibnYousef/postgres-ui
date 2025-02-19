import pool from "@/lib/db";
import SchemaGraph from "@/components/schema-graph";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

async function getSchemaData() {
    try {
        // Get all tables
        const tablesQuery = `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        const { rows: tables } = await pool.query(tablesQuery);
        const tableNames = tables.map((t: { table_name: string }) => t.table_name);

        // Get all columns for each table
        const columnsQuery = `
      SELECT table_name, column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
      ORDER BY table_name, ordinal_position;
    `;
        const { rows: columns } = await pool.query(columnsQuery);

        // Group columns by table
        const tableColumns: Record<
            string,
            { column_name: string; data_type: string }[]
        > = {};
        columns.forEach((col) => {
            if (!tableColumns[col.table_name]) {
                tableColumns[col.table_name] = [];
            }
            tableColumns[col.table_name].push({
                column_name: col.column_name,
                data_type: col.data_type,
            });
        });

        // Get foreign key relationships
        const foreignKeysQuery = `
      SELECT
        kcu.table_name,
        kcu.column_name AS column,
        ccu.table_name AS referenced_table
      FROM information_schema.key_column_usage AS kcu
      JOIN information_schema.constraint_column_usage AS ccu
        ON kcu.constraint_name = ccu.constraint_name
      WHERE kcu.table_schema = 'public'
    `;
        const { rows: foreignKeys } = await pool.query(foreignKeysQuery);

        return { tableNames, tableColumns, foreignKeys };
    } catch (error) {
        console.error("Error fetching schema data:", error);
        return { tableNames: [], tableColumns: {}, foreignKeys: [] };
    }
}

export default async function SchemaPage() {
    const { tableNames, tableColumns, foreignKeys } = await getSchemaData();

    return (
        <main className="p-6">
            <div className="flex items-center mb-4 gap-4">
                <Link
                    className={cn(
                        buttonVariants({ variant: "outline", size: "icon" }),
                        "rounded-full"
                    )}
                    href={"/"}
                    replace
                >
                    <ChevronLeft />
                </Link>
                <h1 className="text-2xl font-semibold">
                    Database Schema Visualization
                </h1>
            </div>
            <SchemaGraph
                tables={tableNames}
                tableColumns={tableColumns}
                foreignKeys={foreignKeys}
            />
        </main>
    );
}
