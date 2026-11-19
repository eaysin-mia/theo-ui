"use client";

import type { OrganizationLocalization } from "@better-auth-ui/core/plugins/organization";

import { Button } from "theo-ui/components/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "theo-ui/components/pagination";
import {
  Select,
  SelectItem,
  SelectPopup,
  SelectTrigger,
  SelectValue,
} from "theo-ui/components/select";
import { ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS } from "./organization-table-state";

/**
 * Organization table pagination — page-range Select + Prev/Next buttons.
 * Follows the p-table-8 particle pattern.
 */
export function OrganizationTablePagination({
  canNextPage,
  canPreviousPage,
  disabled,
  localization,
  onNextPage,
  onPageSizeChange,
  onPreviousPage,
  pageCount,
  pageIndex,
  pageSize,
  rowCount,
  visibleRowCount,
}: {
  disabled?: boolean;
  onNextPage: () => void;
  onPageSizeChange: (pageSize: number) => void;
  onPreviousPage: () => void;
  pageCount: number;
  pageIndex: number;
  pageSize: number;
  rowCount: number;
  visibleRowCount: number;
  canNextPage: boolean;
  canPreviousPage: boolean;
  localization: OrganizationLocalization;
}) {
  if (rowCount === 0) return null;

  const pageSizeOptions = Array.from(
    new Set([...ORGANIZATION_TABLE_PAGE_SIZE_OPTIONS, pageSize]),
  ).sort((a, b) => a - b);

  // Build page-range items for the Select: each entry shows "from–to" and its
  // value is the 1-based page number.
  const pageRangeItems = Array.from(
    { length: Math.max(1, pageCount) },
    (_, i) => {
      const start = i * pageSize + 1;
      const end = Math.min((i + 1) * pageSize, rowCount);
      return { label: `${start}–${end}`, value: i + 1 };
    },
  );

  return (
    <div className="flex items-center justify-between gap-2">
      {/* Left: page-range selector + total */}
      <div className="flex items-center gap-2 whitespace-nowrap">
        <p className="text-sm text-muted-foreground">
          {localization.rowsPerPage}
        </p>
        <Select
          items={pageSizeOptions.map((s) => ({ label: String(s), value: s }))}
          onValueChange={(value) => onPageSizeChange(value as number)}
          value={pageSize}
          disabled={disabled}
        >
          <SelectTrigger
            aria-label={localization.rowsPerPage}
            className="min-w-none w-fit"
            size="sm"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectPopup>
            {pageSizeOptions.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectPopup>
        </Select>

        <p className="text-sm text-muted-foreground">
          {localization.paginationRange
            .replace("{{from}}", String(pageIndex * pageSize + 1))
            .replace(
              "{{to}}",
              String(
                Math.min(pageIndex * pageSize + visibleRowCount, rowCount),
              ),
            )
            .replace("{{total}}", String(rowCount))}
        </p>
      </div>

      {/* Right: previous / next */}
      <Pagination className="justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              className="sm:*:[svg]:hidden"
              render={
                <Button
                  disabled={disabled || !canPreviousPage}
                  onClick={onPreviousPage}
                  size="sm"
                  variant="outline"
                />
              }
            />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              className="sm:*:[svg]:hidden"
              render={
                <Button
                  disabled={disabled || !canNextPage}
                  onClick={onNextPage}
                  size="sm"
                  variant="outline"
                />
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
