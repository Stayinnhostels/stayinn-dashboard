import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Archive, ArchiveRestore, BedDouble, CalendarPlus, ChevronLeft, Download, Inbox, Phone, Plus, Search, Send, Smartphone, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton } from "@/components/glass";
import { PageHeader } from "@/components/admin/page-header";
import { Segmented } from "@/components/admin/finance/finance-kit";
import { waLink } from "@/components/admin/security/deposit-shared";
import { useContactMessagesQuery, useUpdateContactMessageMutation } from "@/queries/contact";
import { downloadContactCsvApi, getContactContextApi, postContactReplyApi } from "@/api/contact";
import { contactMessageKeys } from "@/queries/keys/contact.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { ContactContext, ContactMessage, ContactMessageStatus } from "@/types/domain/contact.types";

/** Figma 14.01 · Messages inbox (+ 14.03 mobile). */
export const Route = createFileRoute("/admin/messages")({ component: MessagesPage });

const card = "glass-2 rounded-[22px] p-4 md:p-5";
const initials = (n: string) => {
  const p = n.trim().split(/\s+/).filter(Boolean);
  return ((p[0]?.[0] ?? "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
};
function stamp(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (d.toDateString() === y.toDateString()) return "Yesterday";
  if (now.getTime() - d.getTime() < 6 * 86_400_000) return d.toLocaleDateString("en-GB", { weekday: "short" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}
function dayLine(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const today = new Date().toDateString() === d.toDateString();
  return `${today ? "Today" : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })} · ${time}`;
}

const CHIPS = [
  ["room", "Room available"],
  ["rent", "Rent & food"],
  ["visit", "Visit timings"],
  ["girls", "Girls floor"],
  ["thanks", "Thanks"],
] as const;
type ChipKey = (typeof CHIPS)[number][0];

function chipText(k: ChipKey, m: ContactMessage, ctx: ContactContext | undefined) {
  const first = m.guest_name.trim().split(/\s+/)[0] || "there";
  const s = ctx?.suggestion;
  const price = s?.price ? `${formatMoney(s.price, s.currency)} / month` : null;
  switch (k) {
    case "room":
      return s ? `Hi ${first}, yes — ${s.room_label} (${s.room_title}) is free right now${price ? `. Rent is ${price}` : ""}. You are welcome to visit any day 10 AM – 7 PM.` : `Hi ${first}, thanks for asking. Let us check availability for your dates and get back to you today.`;
    case "rent":
      return `Hi ${first}, ${price ? `rent starts at ${price}` : "rent depends on the room"}. Meals are optional and charged separately. Electricity, WiFi and water are included.`;
    case "visit":
      return `Hi ${first}, you can visit any day between 10 AM and 7 PM. Please bring your CNIC if you'd like to book on the spot.`;
    case "girls":
      return `Hi ${first}, yes — we have a separate floor for girls with its own entrance and a female warden.`;
    case "thanks":
      return `Thank you ${first}! Let us know if there is anything else we can help with.`;
  }
}

function useIsDesktop() {
  const q = "(min-width: 1024px)";
  const [v, setV] = useState(() => typeof window !== "undefined" && window.matchMedia(q).matches);
  useEffect(() => {
    const m = window.matchMedia(q);
    const on = () => setV(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return v;
}

function MessagesPage() {
  const token = useAuthStore((s) => s.token);
  const desktop = useIsDesktop();
  const [tab, setTab] = useState<ContactMessageStatus>("new");
  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setQ(search), 250);
    return () => window.clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useContactMessagesQuery({ status: tab, limit: 100, ...(q.trim() ? { search: q.trim() } : {}) });
  const messages = data?.messages ?? [];
  const stats = data?.stats;
  const selected = messages.find((m) => m.id === selectedId) ?? (desktop ? messages[0] : undefined) ?? null;

  useEffect(() => {
    if (desktop && messages.length && !messages.some((m) => m.id === selectedId)) setSelectedId(messages[0].id);
  }, [desktop, messages, selectedId]);

  const showList = desktop || !selected;

  return (
    <>
      <PageHeader
        title="Messages"
        subtitle={desktop ? "Questions from your website contact form · reply by email or WhatsApp" : `${stats?.new ?? 0} new`}
        actions={
          showList ? (
            <>
              <Segmented
                label="Show"
                value={tab}
                onChange={(v) => {
                  setTab(v);
                  setSelectedId(null);
                }}
                options={[
                  ["new", "New", stats?.new],
                  ["read", "Read", stats?.read],
                  ["archived", "Archived", stats?.archived],
                ] as const}
              />
              <GlassButton variant="glass" className="max-sm:hidden" onClick={() => token && downloadContactCsvApi(token, tab).catch((e) => toast.error(e instanceof Error ? e.message : "Export failed"))}>
                <Download aria-hidden /> Export
              </GlassButton>
            </>
          ) : null
        }
      />

      <div className="grid items-start gap-4 md:gap-5 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
        {showList ? (
          <div className="glass-2 flex min-w-0 flex-col overflow-hidden rounded-[22px]">
            <div className="p-4">
              <label className="flex h-10 items-center gap-2.5 rounded-[12px] bg-glass-inset px-3 focus-within:ring-2 focus-within:ring-brand-tint">
                <Search className="size-4 shrink-0 text-ink-2" aria-hidden />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email or words" aria-label="Search messages" className="min-w-0 flex-1 bg-transparent text-body text-ink outline-none placeholder:text-ink-2" />
                {search ? (
                  <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="cursor-pointer text-ink-2 hover:text-ink">
                    <X className="size-4" />
                  </button>
                ) : null}
              </label>
            </div>
            {isError ? (
              <p className="px-4 py-12 text-center text-body text-danger">Could not load messages. Is the API running?</p>
            ) : isLoading ? (
              <div className="flex flex-col gap-2 px-4 pb-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-[72px] animate-pulse rounded-[14px] bg-glass-inset" />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <p className="px-4 pt-6 pb-10 text-center text-body text-ink-2">{q ? "No messages match." : tab === "new" ? "No new messages. Questions from your website show up here." : "Nothing here."}</p>
            ) : (
              <ul className="flex flex-col">
                {messages.map((m) => {
                  const active = desktop && selected?.id === m.id;
                  const unread = m.status === "new";
                  return (
                    <li key={m.id} className="border-t border-glass-divider">
                      <button type="button" onClick={() => setSelectedId(m.id)} aria-current={active ? "true" : undefined} className={cn("flex w-full cursor-pointer items-start gap-3 px-4 py-3.5 text-left transition-colors", active ? "bg-glass-inset/60" : "hover:bg-glass-inset/40")}>
                        <span className="flex size-9 shrink-0 items-center justify-center text-label font-semibold text-ink">{initials(m.guest_name)}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline gap-2">
                            <p className={cn("min-w-0 flex-1 truncate text-body", unread ? "font-semibold text-ink" : "text-ink-2")}>{m.guest_name}</p>
                            <span className="shrink-0 text-label text-ink-2">{stamp(m.created_at)}</span>
                            {unread ? <span className="size-2 shrink-0 rounded-full bg-brand" aria-label="New" /> : null}
                          </div>
                          <p className="line-clamp-2 text-label text-ink-2">{m.message}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : null}

        {selected ? <Conversation key={selected.id} m={selected} onBack={desktop ? undefined : () => setSelectedId(null)} /> : desktop && !isLoading ? (
          <div className={cn(card, "flex min-h-[280px] flex-col items-center justify-center gap-2 text-center")}>
            <Inbox className="size-8 text-ink-3" aria-hidden />
            <p className="text-card-title text-ink">No message selected</p>
          </div>
        ) : null}
      </div>
    </>
  );
}

function Conversation({ m, onBack }: { m: ContactMessage; onBack?: () => void }) {
  const token = useAuthStore((s) => s.token);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const setStatus = useUpdateContactMessageMutation();
  const ctxQ = useQuery({ queryKey: ["contact-context", m.id], queryFn: () => getContactContextApi(token as string, m.id), enabled: Boolean(token) });
  const ctx = ctxQ.data;
  const [channel, setChannel] = useState<"email" | "whatsapp">("email");
  const [chip, setChip] = useState<ChipKey | null>(null);
  const [text, setText] = useState("");
  const reply = useMutation({
    mutationFn: (v: { channel: "email" | "whatsapp"; body: string }) => postContactReplyApi(token as string, m.id, v),
    onSuccess: () => void qc.invalidateQueries({ queryKey: contactMessageKeys.all }),
  });

  // Default reply: the "Room available" answer when the message asks about a room.
  useEffect(() => {
    if (ctx && !text && chip === null) {
      setChip(ctx.suggestion ? "room" : null);
      if (ctx.suggestion) setText(chipText("room", m, ctx));
    }
  }, [ctx]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = () => {
    const body = text.trim();
    if (!body) return toast.error("Write a reply first");
    if (channel === "whatsapp") {
      if (!m.guest_phone) return toast.error("No phone number on this message — reply by email");
      window.open(waLink(m.guest_phone, body), "_blank", "noopener");
    }
    reply.mutate(
      { channel, body },
      {
        onSuccess: () => {
          toast.success(channel === "email" ? `Reply emailed to ${m.guest_email}` : "Reply opened in WhatsApp");
          setText("");
          setChip(null);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not send"),
      },
    );
  };

  const archived = m.status === "archived";
  const sub = [m.guest_email, m.guest_phone, "from website contact form"].filter(Boolean).join(" · ");

  return (
    <div className="flex min-w-0 flex-col gap-4 md:gap-5">
      {onBack ? (
        <button type="button" onClick={onBack} className="flex w-fit cursor-pointer items-center gap-1.5 text-body text-ink-2">
          <ChevronLeft className="size-4" aria-hidden /> All messages
        </button>
      ) : null}
      <div className={cn(card, "flex flex-wrap items-center gap-x-4 gap-y-3")}>
        <span className="flex size-11 shrink-0 items-center justify-center text-body font-semibold text-ink">{initials(m.guest_name)}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="truncate text-[24px] leading-8 font-semibold tracking-[-0.24px] text-ink">{m.guest_name}</h2>
            {ctx ? (
              <span className="inline-flex h-[22px] shrink-0 items-center gap-1.5 rounded-full border border-ink-2/70 px-2 text-[12px] font-medium text-ink-2">
                <span className="size-1.5 rounded-full bg-current" aria-hidden />
                {ctx.lead ? "New lead" : ctx.booking_status === "checked_in" ? "Resident" : "Has an account"}
              </span>
            ) : null}
          </div>
          <p className="truncate text-label text-ink-2">{sub}</p>
        </div>
        <div className="flex items-center gap-2">
          {m.guest_phone ? (
            <>
              <a href={`tel:${m.guest_phone}`} aria-label="Call" className="glass-2 flex size-10 items-center justify-center rounded-[12px] text-ink hover:bg-glass-inset">
                <Phone className="size-[18px]" aria-hidden />
              </a>
              <a href={waLink(m.guest_phone, `Hi ${m.guest_name.split(" ")[0]}, `)} target="_blank" rel="noreferrer" aria-label="WhatsApp" className="glass-2 flex size-10 items-center justify-center rounded-[12px] text-ink hover:bg-glass-inset">
                <Smartphone className="size-[18px]" aria-hidden />
              </a>
            </>
          ) : null}
          {m.status === "new" ? (
            <GlassButton variant="ghost" size="sm" className="h-10 rounded-[12px]" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: m.id, status: "read" }, { onSuccess: () => toast.success("Marked as read") })}>
              Mark read
            </GlassButton>
          ) : null}
          <GlassButton variant="glass" size="sm" className="h-10 rounded-[12px]" disabled={setStatus.isPending} onClick={() => setStatus.mutate({ id: m.id, status: archived ? "read" : "archived" }, { onSuccess: () => toast.success(archived ? "Moved back to Read" : "Archived") })}>
            {archived ? <ArchiveRestore aria-hidden /> : <Archive aria-hidden />} {archived ? "Unarchive" : "Archive"}
          </GlassButton>
        </div>
      </div>

      <div className={cn(card, "flex flex-col gap-3")}>
        <p className="text-[11px] leading-4 font-semibold tracking-[0.06em] text-ink-2 uppercase">{dayLine(m.created_at)}</p>
        <p className="max-w-[560px] rounded-[16px] rounded-tl-[6px] bg-glass-inset px-4 py-3 text-body whitespace-pre-line text-ink">{m.message}</p>
        {(m.replies ?? []).map((r) => (
          <div key={r.id} className="flex flex-col items-end gap-1">
            <p className="max-w-[560px] rounded-[16px] rounded-tr-[6px] bg-brand-tint px-4 py-3 text-body whitespace-pre-line text-ink">{r.body}</p>
            <p className="text-label text-ink-3">
              {r.channel === "email" ? "Emailed" : "WhatsApp"}
              {r.by_name ? ` by ${r.by_name}` : ""} · {stamp(r.at)}
            </p>
          </div>
        ))}
        {ctx?.suggestion ? (
          <div className="flex flex-wrap items-center gap-3 rounded-[14px] bg-glass-inset px-4 py-3">
            <BedDouble className="size-4 shrink-0 text-ink-2" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="text-body font-semibold text-ink">Helpful: {ctx.suggestion.title}</p>
              <p className="truncate text-label text-ink-2">
                {[ctx.suggestion.room_label, ctx.suggestion.room_title, ctx.suggestion.price ? `${formatMoney(ctx.suggestion.price, ctx.suggestion.currency)} / month` : null].filter(Boolean).join(" · ")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setChip("room");
                setText(chipText("room", m, ctx));
              }}
              className="flex cursor-pointer items-center gap-1.5 text-label font-medium text-ink-2 hover:text-ink"
            >
              <Plus className="size-4" aria-hidden /> Insert in reply
            </button>
          </div>
        ) : null}
      </div>

      <div className={cn(card, "flex flex-col gap-3")}>
        <div className="flex items-center gap-3">
          <p className="flex-1 text-card-title text-ink">Reply</p>
          <Segmented label="Reply by" value={channel} onChange={setChannel} options={[["email", "Email"], ["whatsapp", "WhatsApp"]] as const} />
        </div>
        <div className="flex flex-wrap gap-2">
          {CHIPS.map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={chip === k}
              onClick={() => {
                setChip(k);
                setText(chipText(k, m, ctx));
              }}
              className={cn("flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 text-label transition-colors", chip === k ? "bg-ink text-glass-3" : "bg-glass-inset text-ink-2 hover:text-ink")}
            >
              <Sparkles className="size-3.5" aria-hidden /> {l}
            </button>
          ))}
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={4000} placeholder={`Write to ${m.guest_name.split(" ")[0]}…`} aria-label="Reply" className="min-h-[76px] w-full resize-y rounded-[14px] border border-glass-stroke bg-glass-inset px-4 py-3 text-body text-ink outline-none focus:border-brand-border" />
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => void navigate({ to: "/admin/bookings", search: { walkin: true } })} className="flex cursor-pointer items-center gap-2 text-label text-ink-2 hover:text-ink">
            <CalendarPlus className="size-4" aria-hidden /> Create booking
          </button>
          <span className="flex-1" />
          <span className="text-label text-ink-2 max-sm:hidden">{m.status === "new" ? "Marked as read after sending" : channel === "email" ? `Sends to ${m.guest_email}` : m.guest_phone || "No phone number"}</span>
          <GlassButton onClick={send} disabled={reply.isPending}>
            <Send aria-hidden /> Send reply
          </GlassButton>
        </div>
      </div>
    </div>
  );
}
