import { Banknote, CalendarDays, CalendarClock, CheckCheck, Info, MailCheck, RefreshCw, ShieldCheck, X } from "lucide-react";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RentStatusPill } from "./rent-status";

const ITEMS = [
  { icon: CalendarDays, title: "Rent is counted per calendar month", body: "From the check-in month to the check-out month — one row per month." },
  { icon: MailCheck, title: "Marking Paid emails a receipt", body: "The resident gets a receipt by email straight away." },
  { icon: Banknote, title: "Part payments are fine", body: "Choose Partial and enter what was collected." },
  { icon: CheckCheck, title: "Paying several months", body: "Pick the months in Record payment — each one is marked Paid." },
  { icon: ShieldCheck, title: "Security deposit is separate", body: "Set it on the check-in month; it's tracked on its own." },
  { icon: RefreshCw, title: "Reminder emails", body: "Sent on the days you pick in Settings, or any time with “Email reminders”." },
];

/** Figma 07.08 · How rent works popover. */
export function HowRentWorks() {
  return (
    <Popover>
      <PopoverTrigger className="inline-flex cursor-pointer items-center gap-1 rounded-md text-label font-medium text-brand-text outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-border [&_svg]:size-3.5">
        <Info aria-hidden /> How rent works
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={8} className="glass-3 w-[min(380px,calc(100vw-32px))] rounded-[18px] border-0 p-4 font-geist text-ink shadow-none">
        <div className="mb-3 flex items-center gap-2">
          <Info className="size-4 text-ink-2" aria-hidden />
          <p className="flex-1 text-body font-semibold">How rent works</p>
          <PopoverClose aria-label="Close" className="cursor-pointer rounded-md p-0.5 text-ink-3 hover:text-ink"><X className="size-4" aria-hidden /></PopoverClose>
        </div>
        <ul className="flex flex-col gap-3">
          {ITEMS.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex gap-2.5">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-[8px] bg-glass-inset text-ink-2 [&_svg]:size-3.5"><Icon aria-hidden /></span>
              <div className="min-w-0">
                <p className="text-label font-semibold text-ink">{title}</p>
                <p className="text-label text-ink-2">{body}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 rounded-[12px] bg-glass-inset p-3">
          <p className="mb-2 text-eyebrow text-ink-3 uppercase">What the labels mean</p>
          <div className="flex flex-wrap items-center gap-1.5">
            <RentStatusPill status="paid" />
            <RentStatusPill status="partial" />
            <RentStatusPill status="not_paid" />
            <RentStatusPill status="returned" />
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-glass-divider px-2.5 text-label text-ink-3 [&_svg]:size-3.5"><CalendarClock aria-hidden /> Upcoming</span>
            <span className="text-label text-ink-3">— — not in stay</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
