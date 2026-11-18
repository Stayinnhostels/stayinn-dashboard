import { toast } from "sonner";
import { CheckCircle2, X } from "lucide-react";

const DURATION = 6000;

/** Figma 05.10 toast: "Ahmed Khan checked in · Room 15" + detail + success progress bar. */
export function showWalkInSuccessToast({
  guestName,
  roomLabel,
  status,
  detail,
}: {
  guestName: string;
  roomLabel: string;
  status: "checked_in" | "confirmed";
  detail: string;
  bookingId?: string;
}) {
  toast.custom(
    (id) => (
      <div role="status" className="glass-3 flex w-[380px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[16px] font-geist text-ink">
        <div className="flex items-start gap-3 px-3.5 py-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-brand text-on-brand [&_svg]:size-[18px]">
            <CheckCircle2 aria-hidden />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <p className="text-body font-semibold text-ink">
              {guestName} {status === "checked_in" ? "checked in" : "reserved"} · {roomLabel}
            </p>
            <p className="text-label font-medium text-ink-2">{detail}</p>
          </div>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => toast.dismiss(id)}
            className="cursor-pointer rounded-md p-0.5 text-ink-2 outline-none hover:text-ink focus-visible:ring-2 focus-visible:ring-brand-border"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="h-[3px] w-full bg-glass-inset">
          <div
            className="h-full bg-success"
            style={{ animation: `walkin-toast-progress ${DURATION}ms linear forwards` }}
          />
        </div>
      </div>
    ),
    { duration: DURATION },
  );
}
