import { useEffect, useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Check, Loader2, MessageCircle, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { useSendResidentRemindersMutation } from "@/queries/residents";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { RollRow, RollSummary } from "@/types/domain/resident-roll.types";

const DEFAULT_MESSAGE = "Hi {name}, your {month} rent of {amount} is still due. Please pay at the front desk. Thank you — StayInn";
const TOKENS = ["{name}", "{month}", "{amount}", "{room}"];
type Group = "not_paid" | "partial" | "paid";

/** Figma 07.20 · Email rent reminders. `bookingIds` limits it to the selected rows (bulk bar). */
export function EmailRemindersDialog({
  open,
  onOpenChange,
  month,
  monthName,
  hostelId,
  summary,
  sample,
  bookingIds,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  month: string;
  monthName: string;
  hostelId?: string;
  summary: RollSummary | undefined;
  /** A row used for the live preview (first unpaid resident). */
  sample: RollRow | undefined;
  bookingIds?: string[];
}) {
  const send = useSendResidentRemindersMutation();
  const [groups, setGroups] = useState<Group[]>(["not_paid", "partial"]);
  const [message, setMessage] = useState(DEFAULT_MESSAGE);

  useEffect(() => {
    if (!open) return;
    setGroups(["not_paid", "partial"]);
    setMessage(DEFAULT_MESSAGE);
  }, [open]);

  const counts: Record<Group, number> = {
    not_paid: summary?.not_paid.count ?? 0,
    partial: summary?.partial.count ?? 0,
    paid: summary?.paid.count ?? 0,
  };
  const total = bookingIds?.length ? bookingIds.length : groups.reduce((s, g) => s + counts[g], 0);

  const preview = useMemo(() => {
    if (!sample) return message;
    const amount = sample.this_month.status === "paid" ? sample.this_month.rent : sample.this_month.left;
    return message
      .replaceAll("{name}", sample.name.split(" ")[0])
      .replaceAll("{month}", monthName)
      .replaceAll("{amount}", formatMoney(amount, sample.currency))
      .replaceAll("{room}", sample.room_label);
  }, [message, sample, monthName]);

  function submit() {
    send.mutate(
      { month, hostel: hostelId, statuses: groups, booking_ids: bookingIds, message: message.trim() || undefined },
      {
        onSuccess: (r) => {
          const extra = [r.skipped_no_email ? `${r.skipped_no_email} without email` : null, r.failed ? `${r.failed} failed` : null].filter(Boolean).join(" · ");
          if (r.sent > 0) toast.success(`Sent ${r.sent} reminder${r.sent === 1 ? "" : "s"}${extra ? ` · ${extra}` : ""}`);
          else toast.error(`No reminders sent${extra ? ` · ${extra}` : ""}`);
          onOpenChange(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send reminders"),
      },
    );
  }

  const chip = (g: Group, label: string) => {
    const on = groups.includes(g);
    return (
      <button
        key={g}
        type="button"
        aria-pressed={on}
        disabled={Boolean(bookingIds?.length)}
        onClick={() => setGroups((cur) => (on ? cur.filter((x) => x !== g) : [...cur, g]))}
        className={cn(
          "flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-label font-medium outline-none focus-visible:ring-2 focus-visible:ring-brand-border disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-3.5",
          on ? "border-ink/60 bg-glass-2 text-ink" : "border-glass-divider bg-glass-inset text-ink-3 hover:text-ink",
        )}
      >
        {on ? <Check aria-hidden /> : <Plus aria-hidden />}
        {label}
        <span className="text-ink-3">{counts[g]}</span>
      </button>
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          aria-describedby={undefined}
          className="glass-3 fixed inset-x-0 bottom-0 z-50 flex max-h-[94svh] flex-col overflow-hidden rounded-t-[28px] font-geist text-ink outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[min(720px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[28px]"
        >
          <div className="flex items-start gap-3 border-b border-glass-divider px-6 py-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-[12px] bg-brand-tint text-brand-text [&_svg]:size-[18px]"><MessageCircle aria-hidden /></span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-hero text-ink">Email rent reminders</Dialog.Title>
              <p className="text-label text-ink-2">
                {bookingIds?.length ? `Email the ${bookingIds.length} selected resident${bookingIds.length === 1 ? "" : "s"}` : `Email everyone who hasn't paid ${monthName}`}
              </p>
            </div>
            <Dialog.Close aria-label="Close" className="glass-2 flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-ink outline-none hover:bg-glass-inset"><X className="size-[18px]" aria-hidden /></Dialog.Close>
          </div>

          <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
            {!bookingIds?.length ? (
              <div className="flex flex-col gap-2">
                <p className="text-label font-medium text-ink-2">Who should get it?</p>
                <div className="flex flex-wrap gap-2">
                  {chip("not_paid", "Not paid")}
                  {chip("partial", "Part paid")}
                  {chip("paid", "Paid")}
                </div>
              </div>
            ) : null}
            <div className="flex items-center gap-2">
              <span className="text-label font-medium text-ink-2">Send by</span>
              <span className="glass-2 rounded-[10px] px-3 py-1 text-label font-medium text-ink">Email</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <p className="text-label font-medium text-ink-2">Message</p>
                <div className="flex flex-col gap-2 rounded-[14px] border border-glass-divider bg-glass-inset p-3 focus-within:ring-2 focus-within:ring-brand-border">
                  <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={2000} className="w-full resize-none bg-transparent text-body text-ink outline-none" aria-label="Message" />
                  <div className="flex flex-wrap gap-1.5">
                    {TOKENS.map((t) => (
                      <button key={t} type="button" onClick={() => setMessage((m) => `${m}${m.endsWith(" ") ? "" : " "}${t}`)} className="cursor-pointer rounded-full border border-glass-divider bg-glass-2 px-2 py-0.5 text-[11px] text-ink-2 hover:text-ink">
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="truncate text-label font-medium text-ink-2">Email preview{sample ? ` · ${sample.name}` : ""}</p>
                <div className="flex flex-col gap-2 rounded-[14px] border border-glass-divider bg-glass-inset p-3">
                  <div className="rounded-[10px] bg-glass-2 p-3">
                    <p className="text-body whitespace-pre-wrap text-ink">{preview}</p>
                    <p className="mt-2 text-label text-ink-3">Subject: {monthName} rent reminder</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 border-t border-glass-divider px-6 py-4">
            <p className="min-w-0 flex-1 text-label text-ink-3">Also sent automatically on the reminder days set in Settings.</p>
            <Dialog.Close asChild><GlassButton variant="ghost">Cancel</GlassButton></Dialog.Close>
            <GlassButton onClick={submit} disabled={total === 0 || send.isPending || (!bookingIds?.length && groups.length === 0)}>
              {send.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <MessageCircle aria-hidden />} Send {total} email{total === 1 ? "" : "s"}
            </GlassButton>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
