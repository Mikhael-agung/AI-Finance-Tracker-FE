"use client";

import type { ComponentType } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/shared/EmptyState";
import { TransactionItem } from "./TransactionItem";
import { useTransactionStore } from "@/lib/store/transaction.store";

export function TransactionTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const transactions = useTransactionStore((s) => s.transactions);
  const loading = useTransactionStore((s) => s.loading);
  const pagination = useTransactionStore((s) => s.pagination);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${pathname}?${params.toString()}`);
  };

  const { page, totalPages, totalItems, limit } = pagination;
  const showingFrom = totalItems === 0 ? 0 : (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, totalItems);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="text-xs font-bold uppercase tracking-widest">
                Tanggal
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest">
                Deskripsi
              </TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-bold uppercase tracking-widest">
                Kategori
              </TableHead>
              <TableHead className="hidden sm:table-cell text-xs font-bold uppercase tracking-widest">
                Dompet
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-right">
                Jumlah
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading &&
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCellSkeleton width="w-16" />
                  <TableCellSkeleton width="w-36" />
                  <TableCellSkeleton width="w-20" />
                  <TableCellSkeleton width="w-20" />
                  <TableCellSkeleton width="w-16" align="right" />
                </TableRow>
              ))}

            {!loading &&
              transactions.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} />
              ))}
          </TableBody>
        </Table>

        {!loading && transactions.length === 0 && (
          <div className="py-12">
            {(() => {
              const EmptyStateWithProps = EmptyState as ComponentType<{
                title: string;
                description: string;
              }>;

              return (
                <EmptyStateWithProps
                  title="Belum ada transaksi"
                  description="Transaksi yang cocok dengan filter kamu belum ditemukan."
                />
              );
            })()}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalItems > 0 && (
        <div className="px-6 py-4 bg-muted/30 flex items-center justify-between border-t border-border flex-wrap gap-3">
          <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-widest">
            Menampilkan {showingFrom}-{showingTo} dari {totalItems} transaksi
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
              aria-label="Halaman sebelumnya"
              className="flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1">
              {getPageNumbers(page, totalPages).map((p, idx) =>
                p === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="text-muted-foreground px-1 text-xs"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => goToPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[11px] font-bold transition-colors ${
                      p === page
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {p}
                  </button>
                ),
              )}
            </div>

            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
              aria-label="Halaman berikutnya"
              className="flex items-center justify-center px-2.5 py-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TableCellSkeleton({
  width,
  align = "left",
  className = "",
}: {
  width: string;
  align?: "left" | "right";
  className?: string;
}) {
  return (
    <td className="p-4">
      <Skeleton
        className={`h-4 ${width} ${align === "right" ? "ml-auto" : ""}`}
      />
    </td>
  );
}

/** Generate page numbers dengan ellipsis, mirip pola "1 2 3 ... 9" */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");

  pages.push(total);

  return pages;
}
