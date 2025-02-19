export interface TableInfo {
    table_name: string;
}

export interface ColumnInfo {
    column_name: string;
    data_type: string;
    is_nullable: string;
}

export interface QueryFilters {
    [key: string]: string;
}