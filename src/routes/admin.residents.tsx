import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { FileText, IdCard, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MonthlyRentTableSkeleton } from "@/components/admin/admin-page-skeletons";
import { ResidentDetailSheet } from "@/components/admin/resident-detail-sheet";
import { downloadResidentDossierPdfApi } from "@/api/residents";
import { useResidentsDirectoryQuery } from "@/queries/residents";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import { cn } from "@/lib/utils";
import { useHostelScope } from "@/lib/use-hostel-scope";
import type {
  ResidentDirectoryRow,
  ResidentDirectoryScope,
} from "@/types/domain/resident.types";

export const Route = createFileRoute("/admin/residents")({ component: ResidentsDirectoryPage });

const PAGE_SIZE = 20;

function statusBadgeClass(status: string) {
  switch (status) {
    case "checked_in":
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-800";
    case "confirmed":
      return "border-sky-500/30 bg-sky-500/10 text-sky-800";
    case "checked_out":
      return "border-amber-500/30 bg-amber-500/10 text-amber-900";
    case "pending":
      return "border-violet-500/30 bg-violet-500/10 text-violet-800";
    default:
      return "border-border bg-muted text-muted-foreground";
  }
}

function ResidentsDirectoryPage() {
  const { hostelId } = useHostelScope();
  const token = useAuthStore((s) => s.token);
  const [scope, setScope] = useState<ResidentDirectoryScope>("active");
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 300);
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [pdfBookingId, setPdfBookingId] = useState<string | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const params = useMemo(
    () => ({
      scope,
      page,
      limit: PAGE_SIZE,
      ...(hostelId ? { hostel: hostelId } : {}),
      ...(search ? { search } : {}),
    }),
    [hostelId, scope, page, search],
  );

  const { data, isLoading, isError } = useResidentsDirectoryQuery(params, {
    enabled: Boolean(hostelId),
  });
  const residents = data?.residents ?? [];
  const pagination = data?.pagination;

  async function handleDownloadPdf(row: ResidentDirectoryRow) {
    if (!token) {
      toast.error("You must be signed in to download");
      return;
    }
    setPdfBookingId(row.booking_id);
    try {
      await downloadResidentDossierPdfApi(token, row.booking_id);
      toast.success(`Full record PDF downloaded for ${row.name}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setPdfBookingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          className="sm:max-w-md"
          inputClassName="h-9"
          placeholder="Search name, CNIC, phone, room…"
          value={searchInput}
          onValueChange={setSearchInput}
        />
        <Badge variant="secondary" className="hidden h-9 gap-1.5 px-3 sm:inline-flex">
          <Users className="h-3.5 w-3.5" />
          {pagination?.total ?? 0} residents
        </Badge>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">Residents directory</CardTitle>
          </div>
          <Tabs
            value={scope}
            onValueChange={(v) => {
              setScope(v as ResidentDirectoryScope);
              setPage(1);
            }}
          >
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <MonthlyRentTableSkeleton />
          ) : isError ? (
            <p className="px-4 py-12 text-center text-sm text-destructive">Could not load residents.</p>
          ) : residents.length === 0 ? (
            <p className="px-4 py-12 text-center text-sm text-muted-foreground">
              No residents found{search ? ` for “${search}”` : ""}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[72rem]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">#</TableHead>
                    <TableHead className="min-w-[9rem]">Name</TableHead>
                    <TableHead className="min-w-[6.5rem]">Booking ID</TableHead>
                    <TableHead className="min-w-[10rem]">Email</TableHead>
                    <TableHead className="min-w-[7.5rem]">Number</TableHead>
                    <TableHead className="min-w-[7.5rem]">CNIC</TableHead>
                    <TableHead className="w-14 text-center">ID card</TableHead>
                    <TableHead className="min-w-[7.5rem] max-w-[9rem]">Room</TableHead>
                    <TableHead className="min-w-[5.5rem]">Check-in</TableHead>
                    <TableHead className="min-w-[5.5rem]">Check-out</TableHead>
                    <TableHead className="w-[5rem] text-center">Months</TableHead>
                    <TableHead className="min-w-[5.5rem]">Status</TableHead>
                    <TableHead className="min-w-[6rem] text-right">Collected</TableHead>
                    <TableHead className="sticky right-0 z-10 w-[6.5rem] bg-card pr-4 text-right">
                      PDF
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents.map((r) => {
                    const roomLabel = r.room_title || r.room_seat || "—";
                    return (
                      <TableRow
                        key={r.booking_id}
                        className="cursor-pointer"
                        onClick={() => setDetailId(r.booking_id)}
                      >
                        <TableCell className="text-xs text-muted-foreground tabular-nums">
                          {r.serial_no}
                        </TableCell>
                        <TableCell className="max-w-[10rem] font-medium">
                          <HintTooltip label={r.name} className="w-full">
                            <span className="block truncate">{r.name}</span>
                          </HintTooltip>
                        </TableCell>
                        <TableCell className="max-w-[7rem] whitespace-nowrap text-xs tabular-nums">
                          <HintTooltip label={r.booking_ref} className="w-full">
                            <span className="block truncate">{r.booking_ref}</span>
                          </HintTooltip>
                        </TableCell>
                        <TableCell className="max-w-[11rem] text-xs">
                          <HintTooltip label={r.email || undefined} className="w-full">
                            <span className="block truncate">{r.email || "—"}</span>
                          </HintTooltip>
                        </TableCell>
                        <TableCell className="max-w-[8rem] whitespace-nowrap text-xs tabular-nums">
                          <HintTooltip label={r.contact_number || undefined} className="w-full">
                            <span className="block truncate">{r.contact_number || "—"}</span>
                          </HintTooltip>
                        </TableCell>
                        <TableCell className="max-w-[8rem] whitespace-nowrap text-xs tabular-nums">
                          <HintTooltip label={r.cnic || undefined} className="w-full">
                            <span className="block truncate">{r.cnic || "—"}</span>
                          </HintTooltip>
                        </TableCell>
                        <TableCell className="text-center">
                          <HintTooltip
                            label={
                              r.has_cnic_images
                                ? "ID card on file — included in PDF"
                                : "No ID card images"
                            }
                          >
                            <span
                              className={cn(
                                "inline-flex h-8 w-8 items-center justify-center rounded-full border",
                                r.has_cnic_images
                                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-700"
                                  : "border-border bg-muted/40 text-muted-foreground",
                              )}
                            >
                              <IdCard className="h-4 w-4" />
                            </span>
                          </HintTooltip>
                        </TableCell>
                        <TableCell className="max-w-[9rem]">
                          <HintTooltip label={roomLabel} className="w-full">
                            <span className="block truncate text-sm">{roomLabel}</span>
                          </HintTooltip>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs tabular-nums">
                          {r.check_in ?? "—"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-xs tabular-nums">
                          {r.check_out ?? "—"}
                        </TableCell>
                        <TableCell className="text-center text-xs tabular-nums font-semibold">
                          {r.months_living}/{r.months_in_stay}
                        </TableCell>
                        <TableCell>
                          <HintTooltip label={r.status.replace(/_/g, " ")}>
                            <Badge
                              variant="outline"
                              className={cn("max-w-full truncate text-xs", statusBadgeClass(r.status))}
                            >
                              {r.status.replace(/_/g, " ")}
                            </Badge>
                          </HintTooltip>
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right text-sm font-semibold tabular-nums">
                          {formatMoney(r.total_rent_collected, r.currency)}
                        </TableCell>
                        <TableCell
                          className="sticky right-0 z-10 bg-card pr-4 text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8"
                            disabled={pdfBookingId === r.booking_id}
                            onClick={() => void handleDownloadPdf(r)}
                          >
                            {pdfBookingId === r.booking_id ? (
                              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <FileText className="mr-1.5 h-3.5 w-3.5" />
                            )}
                            PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {pagination && pagination.total > 0 ? (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 px-4 py-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages} · {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="min-w-[6rem] text-center text-sm tabular-nums text-muted-foreground">
                {pagination.page} / {pagination.pages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <ResidentDetailSheet
        bookingId={detailId}
        month={new Date().toISOString().slice(0, 7)}
        open={Boolean(detailId)}
        onOpenChange={(v) => !v && setDetailId(null)}
      />
    </div>
  );
}
