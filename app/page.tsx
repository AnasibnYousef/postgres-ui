import { Suspense } from "react"
import pool from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Database, ExternalLink, RefreshCcw } from "lucide-react"
import Link from "next/link"
import AnalyzeTablesButton from "@/components/analyze-tables-button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

async function getTables() {
  try {
    const query = `
      SELECT relname AS table_name, n_live_tup AS estimated_rows 
      FROM pg_stat_user_tables 
      ORDER BY relname;
    `
    const result = await pool.query(query)
    return result.rows
  } catch (error) {
    console.error("Error fetching tables:", error)
    return []
  }
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-[100px]" />
          </div>
        ))}
    </div>
  )
}

function getRowCountBadgeColor(count: number) {
  if (count > 1000) return "default"
  if (count > 100) return "secondary"
  return "outline"
}

export default async function Home() {
  const tables = await getTables()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card className="">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <Database className="h-5 w-5 text-primary" />
              Database Tables
            </CardTitle>
            <div className="flex items-center gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AnalyzeTablesButton />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Analyze all tables to update statistics</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button variant="outline" asChild>
                <Link href="/schema" className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  View Schema
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Suspense fallback={<TableSkeleton />}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Table Name</TableHead>
                  <TableHead className="w-32">Row Count</TableHead>
                  <TableHead className="w-24 text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tables.length > 0 ? (
                  tables.map((table: { table_name: string; estimated_rows: number }) => (
                    <TableRow key={table.table_name} className="group transition-colors hover:bg-muted/50">
                      <TableCell className="font-medium">{table.table_name}</TableCell>
                      <TableCell>
                        <Badge variant={getRowCountBadgeColor(table.estimated_rows)}>
                          {table.estimated_rows.toLocaleString()} rows
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100" asChild>
                          <Link href={`/tables/${table.table_name}`}>View Data</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>
                      <div className="flex min-h-[200px] flex-col items-center justify-center space-y-3 py-8">
                        <div className="rounded-full bg-muted p-3">
                          <Database className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">No tables found in the database</p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                          <RefreshCcw className="h-4 w-4" />
                          Refresh
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

