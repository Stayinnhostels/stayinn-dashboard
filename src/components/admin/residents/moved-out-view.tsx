import { StickyBar } from "@/components/admin/sticky-bar";
import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight, FileText, Info, Loader2, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { GlassSearch } from "@/components/glass";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { downloadResidentDossierPdfApi } from "@/api/residents";
import { useMovedOutQuery } from "@/queries/residents";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { MovedOutRow } from "@/types/domain/resident-roll.types";
import { CountUp } from "@/components/admin/dashboard/dashboard-motion";

const PAGE = 20;
const dm = (k: string | null) => {
  if (!k) return { d: "—", y: "" };
  const [y, m, d] = k.split("-").map(Number);
  return { d: new Date(y, m - 1, d).toLocaleDateString("en-GB", { day: "numeric", month: "short" }), y: String(y) };
};

/** Figma 07.07 · Residents · Moved out. */
export function MovedOutView({ hostelId }: { hostelId?: string }) {
  const token = useAuthStore((s) => s.token);
  const [q, setQ] = useState("");
  const search = useDebouncedValue(q.trim(), 300);
  const [leftIn, setLeftIn] = useState("any");
  const [page, setPage] = useState(1);
  const [pdfId, setPdfId] = useState<string | null>(null);
  useEffect(() => setPage(1), [search, leftIn]);

  const { data, isLoading } = useMovedOutQuery({ hostel: hostelId, search: search || undefined, left_in: leftIn, page, limit: PAGE }, { enabled: Boolean(hostelId) });
  const s = data?.summary;
  const rows = data?.residents ?? [];
  const groups = useMemo(() => {
    const thisMonth = rows.filter((r) => r.left_this_month);
    const earlier = rows.filter((r) => !r.left_this_month);
    return [
      { key: "this", label: "This month", rows: thisMonth },
      { key: "earlier", label: "Earlier", rows: earlier },
    ].filter((g) => g.rows.length);
  }, [rows]);
  const cur = rows[0]?.currency ?? "pkr";

  async function record(r: MovedOutRow) {
    if (!token) return;
    setPdfId(r.booking_id);
    try {
      await downloadResidentDossierPdfApi(token, r.booking_id);
      toast.success(`Full record PDF downloaded for ${r.name}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "PDF download failed");
    } finally {
      setPdfId(null);
    }
  }

  const leftLabel = leftIn === "any" ? "Left in: any month" : `Left in: ${data?.months.find((m) => m.key === leftIn)?.label ?? leftIn}`;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Left this month" value={s ? String(s.left_this_month) : "—"} sub={s?.next_leaving ? `${s.next_leaving.name.split(" ")[0]} leaves ${dm(s.next_leaving.date).d}` : "No one else leaving"} />
        <Stat label="Deposits to return" value={s ? formatMoney(s.deposits_to_return.amount, cur) : "—"} sub={s ? `${s.deposits_to_return.count} resident${s.deposits_to_return.count === 1 ? "" : "s"}` : ""} />
        <Stat label="Rent still owed" value={s ? formatMoney(s.rent_owed.amount, cur) : "—"} sub={s ? `${s.rent_owed.count} resident${s.rent_owed.count === 1 ? "" : "s"}` : ""} danger={(s?.rent_owed.amount ?? 0) > 0} />
      </div>

      <StickyBar><div className="glass-2 flex flex-wrap items-center gap-2 rounded-[18px] p-2.5">
        <GlassSearch className="min-w-[180px] flex-1 md:max-w-[280px]" placeholder="Name, room or phone" shortcut="" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search moved out" />
        <span className="flex-1" />
        <Popover>
          <PopoverTrigger className="glass-3 flex h-10 cursor-pointer items-center gap-2 rounded-[12px] px-3.5 text-body font-semibold text-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-border">
            <ChevronDown className="size-4" aria-hidden /> {leftLabel}
          </PopoverTrigger>
          <PopoverContent align="end" className="glass-3 w-[220px] rounded-[14px] border-0 p-1 font-geist text-ink shadow-none">
            {[{ key: "any", label: "Any month" }, ...(data?.months ?? [])].map((m) => (
              <button key={m.key} type="button" onClick={() => setLeftIn(m.key)} className={cn("flex w-full cursor-pointer items-center rounded-[10px] px-3 py-2 text-left text-body hover:bg-glass-inset", leftIn === m.key && "bg-brand-tint")}>
                {m.label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div></StickyBar>

      <p className="flex items-center gap-1.5 text-label text-ink-3"><Info className="size-3.5" aria-hidden /> Records are kept forever. Click a name to open their profile.</p>

      <div className="glass-2 overflow-hidden rounded-[20px]">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">{Array.from({ length: 6 }, (_, i) => <div key={i} className="h-12 animate-pulse rounded-[12px] bg-glass-inset" />)}</div>
        ) : rows.length === 0 ? (
          <p className="px-4 py-14 text-center text-body text-ink-2">No one has moved out{search ? ` matching “${search}”` : ""}.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left font-geist">
              <thead>
                <tr className="border-b border-glass-divider bg-glass-inset text-eyebrow text-ink-3 uppercase">
                  <th className="py-3 pl-4 font-medium">Resident</th>
                  <th className="px-3 py-3 font-medium">Room</th>
                  <th className="px-3 py-3 font-medium">Stayed</th>
                  <th className="px-3 py-3 font-medium">Left on</th>
                  <th className="px-3 py-3 font-medium">Rent collected</th>
                  <th className="px-3 py-3 font-medium">Security</th>
                  <th className="pr-4" />
                </tr>
              </thead>
              {groups.map((g) => (
                <tbody key={g.key}>
                  <tr><td colSpan={7} className="px-4 pt-3 pb-1 text-label text-ink-3">{g.label} · {g.rows.length}</td></tr>
                  {g.rows.map((r) => {
                    const left = dm(r.left_on);
                    return (
                      <tr key={r.booking_id} className="border-b border-glass-divider last:border-b-0 hover:bg-glass-inset">
                        <td className="max-w-[240px] py-3 pl-4">
                          <Link to="/admin/residents/$id" params={{ id: r.booking_id }} className="group flex items-center gap-3">
                            <span className="w-7 shrink-0 text-center text-label font-semibold text-ink-2">{r.initials}</span>
                            <span className="flex min-w-0 flex-col">
                              <span className="truncate text-body font-semibold text-ink group-hover:underline">{r.name}</span>
                              {r.occupation ? <span className="truncate text-label text-ink-3">{r.occupation}</span> : null}
                            </span>
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-body whitespace-nowrap text-ink">{r.room_label}</td>
                        <td className="px-3 py-3"><p className="text-body text-ink">{r.stayed}</p><p className="text-label text-ink-3">{r.stayed_months} month{r.stayed_months === 1 ? "" : "s"}</p></td>
                        <td className="px-3 py-3"><p className="text-body text-ink">{left.d}</p><p className="text-label text-ink-3">{left.y}</p></td>
                        <td className="px-3 py-3">
                          <p className="text-body text-ink">{formatMoney(r.rent_collected, r.currency)}</p>
                          <p className={cn("text-label", r.rent_owed > 0 ? "text-danger" : "text-ink-3")}>{r.rent_owed > 0 ? `${formatMoney(r.rent_owed, r.currency)} owed` : "All rent paid"}</p>
                        </td>
                        <td className="px-3 py-3">
                          {r.security.state === "to_return" ? (
                            <><p className="text-body text-ink">To return</p><p className="text-label text-ink-3">{formatMoney(r.security.amount, r.currency)}</p></>
                          ) : r.security.state === "kept" ? (
                            <><p className="text-body text-ink-2">Kept</p>{r.security.note ? <p className="text-label text-ink-3">{r.security.note.toLowerCase()}</p> : null}</>
                          ) : (
                            <p className="text-body text-ink-2">{r.security.state === "returned" ? "Returned" : "—"}</p>
                          )}
                        </td>
                        <td className="pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <button type="button" onClick={() => void record(r)} disabled={pdfId === r.booking_id} className="glass-3 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-label font-semibold text-ink disabled:opacity-60 [&_svg]:size-3.5">
                              {pdfId === r.booking_id ? <Loader2 className="animate-spin" aria-hidden /> : <FileText aria-hidden />} Record
                            </button>
                            <Link to="/admin/bookings/$id" params={{ id: r.booking_id }} hash="booking-invoice" className="inline-flex h-8 items-center gap-1.5 rounded-[10px] px-3 text-label font-medium text-ink-2 hover:bg-glass-inset hover:text-ink [&_svg]:size-3.5">
                              <ReceiptText aria-hidden /> Invoice
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ))}
            </table>
          </div>
        )}
        {data && data.pagination.total > 0 ? (
          <Pager text={`Showing ${rows.length} of ${data.pagination.total} who moved out · newest first`} page={page} pages={data.pagination.pages} onPage={setPage} />
        ) : null}
      </div>
    </div>
  );
}

function Stat({ label, value, sub, danger }: { label: string; value: string; sub: string; danger?: boolean }) {
  return (
    <div className="glass-2 flex flex-col gap-1 rounded-[20px] px-5 py-4">
      <span className="text-label text-ink-2">{label}</span>
      <span className={cn("text-kpi", danger ? "text-danger" : "text-ink")}><CountUp value={value} delay={250} /></span>
      <span className="text-label text-ink-3">{sub}</span>
    </div>
  );
}

export function Pager({ text, page, pages, onPage }: { text: string; page: number; pages: number; onPage: (p: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-glass-divider px-4 py-3">
      <p className="text-label text-ink-3">{text}</p>
      <div className="glass-3 flex items-center gap-1 rounded-[12px] p-1">
        <button type="button" aria-label="Previous page" disabled={page <= 1} onClick={() => onPage(page - 1)} className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-ink hover:bg-glass-inset disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft className="size-4" aria-hidden /></button>
        <span className="px-1.5 text-label font-medium text-ink">{page} of {pages}</span>
        <button type="button" aria-label="Next page" disabled={page >= pages} onClick={() => onPage(page + 1)} className="flex size-7 cursor-pointer items-center justify-center rounded-[8px] text-ink hover:bg-glass-inset disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight className="size-4" aria-hidden /></button>
      </div>
    </div>
  );
}
