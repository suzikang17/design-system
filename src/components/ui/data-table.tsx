import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type Row,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export interface DataTableToolbarProps<TData> {
  table: import("@tanstack/react-table").Table<TData>;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Renders above the table. Receives the table instance for filter/view wiring. */
  toolbar?: (props: DataTableToolbarProps<TData>) => React.ReactNode;
  /** Called when a row is clicked. */
  onRowClick?: (row: Row<TData>) => void;
  /** Renders below a clicked row as an inline expansion panel. */
  renderExpanded?: (row: Row<TData>) => React.ReactNode;
  pageSize?: number;
  /** The choices in the rows-per-page menu. */
  pageSizeOptions?: number[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  onRowClick,
  renderExpanded,
  pageSize = 50,
  pageSizeOptions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [expandedRowId, setExpandedRowId] = React.useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize } },
  });

  // Expose globalFilter setter via the table meta so toolbar can wire a search box
  // without needing a separate prop.
  (table as any)._setGlobalFilter = setGlobalFilter;
  (table as any)._globalFilter = globalFilter;

  const handleRowClick = (row: Row<TData>) => {
    if (renderExpanded) {
      setExpandedRowId((prev) => (prev === row.id ? null : row.id));
    }
    onRowClick?.(row);
  };

  return (
    <div className="space-y-3">
      {toolbar?.({ table })}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow
                    onClick={() => handleRowClick(row)}
                    className={renderExpanded || onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                    data-state={expandedRowId === row.id ? "selected" : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="py-2"
                        style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderExpanded && expandedRowId === row.id && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={columns.length} className="p-0">
                        <div className="bg-muted/30 border-t px-4 py-3">
                          {renderExpanded(row)}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  );
}
