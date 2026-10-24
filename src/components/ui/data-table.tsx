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
  type ExpandedState,
  type FilterFn,
  type SortingState,
  type Table as TanStackTable,
  type VisibilityState,
  type Row,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "@/components/ui/data-table-pagination";

export interface DataTableToolbarProps<TData> {
  table: TanStackTable<TData>;
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** Renders above the table. Receives the table instance for filter/view wiring. */
  toolbar?: (props: DataTableToolbarProps<TData>) => React.ReactNode;
  /** Called when a row is clicked. Clicks on controls inside the row do not count. */
  onRowClick?: (row: Row<TData>) => void;
  /**
   * Renders below an expanded row as an inline panel. A row click toggles it;
   * a cell can call `row.toggleExpanded()` and read `row.getIsExpanded()`.
   */
  renderExpanded?: (row: Row<TData>) => React.ReactNode;
  /**
   * A stable id for each record, so selection and expansion stay with the
   * record when rows are added, removed or reordered. Defaults to the
   * record's `id` field, and to its position when it has none.
   */
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  pageSize?: number;
  /** The choices in the rows-per-page menu. */
  pageSizeOptions?: number[];
}

function defaultRowId<TData>(originalRow: TData, index: number, parent?: Row<TData>): string {
  const id = (originalRow as { id?: unknown } | null)?.id;
  if (typeof id === "string" || typeof id === "number") return String(id);
  return parent ? `${parent.id}.${index}` : String(index);
}

/**
 * The filter every column gets unless it names its own: a list of values
 * (what DataTableFacetedFilter sets) keeps rows whose value is one of them,
 * and anything else is a case-insensitive "contains" match.
 */
const listOrText: FilterFn<unknown> = (row, columnId, filterValue: unknown) => {
  const value = row.getValue(columnId);
  if (Array.isArray(filterValue)) return filterValue.some((option) => String(option) === String(value));
  return String(value ?? "").toLowerCase().includes(String(filterValue).toLowerCase());
};
listOrText.autoRemove = (filterValue: unknown) =>
  filterValue == null || filterValue === "" || (Array.isArray(filterValue) && filterValue.length === 0);

/** Clicks on these, inside a row, belong to the control and not to the row. */
const CONTROLS =
  "button, a, input, select, textarea, label, [role=checkbox], [role=menuitem], [role=option], [role=switch]";

export function DataTable<TData, TValue>({
  columns,
  data,
  toolbar,
  onRowClick,
  renderExpanded,
  getRowId = defaultRowId,
  pageSize = 50,
  pageSizeOptions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    getRowId,
    defaultColumn: { filterFn: listOrText as FilterFn<TData> },
    state: { sorting, columnFilters, columnVisibility, globalFilter, expanded },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    getRowCanExpand: () => Boolean(renderExpanded),
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: { pagination: { pageSize } },
  });

  const handleRowClick = (event: React.MouseEvent<HTMLTableRowElement>, row: Row<TData>) => {
    // A click from a menu portalled out of a cell, or on a control in a cell, is not a row click.
    const target = event.target as Element;
    const control = target.closest(CONTROLS);
    if (!event.currentTarget.contains(target) || (control && event.currentTarget.contains(control))) return;
    if (renderExpanded) row.toggleExpanded();
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
                    onClick={(event) => handleRowClick(event, row)}
                    className={renderExpanded || onRowClick ? "cursor-pointer hover:bg-muted/50" : undefined}
                    data-state={row.getIsExpanded() || row.getIsSelected() ? "selected" : undefined}
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
                  {renderExpanded && row.getIsExpanded() && (
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
