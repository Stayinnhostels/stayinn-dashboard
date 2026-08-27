import { useEffect, useMemo, useState } from "react";
import { Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";
import { downloadResidentMonthInvoiceApi } from "@/api/residents";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useResidentDetailQuery } from "@/queries/residents";
import { formatMoney } from "@/lib/payments";
import { useAuthStore } from "@/stores/auth/auth.store";
import { RENT_PAYMENT_STATUS_LABELS } from "@/types/domain/resident.types";

export function RentInvoiceMonthsDialog({
  bookingId,
  residentName,
  defaultMonths,
  open,
  onOpenChange,
}: {
  bookingId: string | null;
  residentName?: string;
  defaultMonths?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading, isError } = useResidentDetailQuery(open ? bookingId : null);
  const timeline = data?.rent_timeline ?? [];
  const timelineKey = timeline.map((m) => m.month).join(",");
  const defaultKey = (defaultMonths ?? []).join(",");
  const currency = data?.rent_summary?.currency ?? data?.resident?.currency ?? "pkr";
  const [selected, setSelected] = useState<string[]>([]);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!open) return;
    const keys = timelineKey ? timelineKey.split(",") : [];
    const preferred = defaultKey.split(",").filter((m) => m && keys.includes(m));
    setSelected(preferred.length ? preferred : keys.slice(0, 1));
  }, [open, bookingId, timelineKey, defaultKey]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);
  const selectedEntries = timeline.filter((m) => selectedSet.has(m.month));
  const selectedTotal = selectedEntries.reduce((sum, m) => sum + Number(m.rent_amount ?? 0), 0);
  const allSelected = timeline.length > 0 && selected.length === timeline.length;

  function toggleMonth(month: string, checked: boolean) {
    setSelected((prev) => {
      if (checked) return [...new Set([...prev, month])].sort();
      return prev.filter((m) => m !== month);
    });
  }

  async function handleDownload() {
    if (!token || !bookingId || selected.length === 0) {
      toast.error("Select at least one month");
      return;
    }
    setDownloading(true);
    try {
      await downloadResidentMonthInvoiceApi(token, bookingId, selected);
      toast.success(
        selected.length === 1
          ? `Rent invoice for ${selected[0]} downloaded`
          : `Combined invoice for ${selected.length} months downloaded`,
      );
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invoice download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Rent invoice</DialogTitle>
          <DialogDescription>
            {residentName ? `${residentName}. ` : ""}
            Select one month, or several months to combine into a single invoice.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 max-h-[50vh] overflow-y-auto px-6 py-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading months…
            </div>
          ) : isError || timeline.length === 0 ? (
            <p className="py-8 text-center text-sm text-destructive">Could not load stay months.</p>
          ) : (
            <div className="space-y-1">
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="text-xs font-medium text-primary hover:underline"
                  onClick={() =>
                    setSelected(allSelected ? [] : timeline.map((m) => m.month))
                  }
                >
                  {allSelected ? "Clear all" : "Select all"}
                </button>
                <span className="text-xs text-muted-foreground">
                  {selected.length} of {timeline.length} selected
                </span>
              </div>
              {timeline.map((m) => {
                const checked = selectedSet.has(m.month);
                return (
                  <label
                    key={m.month}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => toggleMonth(m.month, v === true)}
                    />
                    <span className="min-w-0 flex-1 text-sm font-medium">{m.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {RENT_PAYMENT_STATUS_LABELS[m.payment_status]}
                    </span>
                    <span className="text-sm tabular-nums">
                      {formatMoney(m.rent_amount, currency)}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-border/60 px-6 py-4 sm:justify-between">
          <p className="text-sm text-muted-foreground sm:mr-auto">
            {selected.length === 0
              ? "No months selected"
              : `Total ${formatMoney(selectedTotal, currency)}`}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={downloading || selected.length === 0} onClick={() => void handleDownload()}>
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Receipt className="mr-2 h-4 w-4" />
            )}
            {selected.length > 1 ? `Download ${selected.length} months` : "Download invoice"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
