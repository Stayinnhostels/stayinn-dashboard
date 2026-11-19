import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Banknote, CalendarDays, Download, FileText, Info, Loader2, MessageCircle, Pencil, Plus, RefreshCw, Trash2, TriangleAlert, X } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassCheckbox } from "@/components/glass";
import { downloadDepositReceiptApi, getDepositDocumentApi } from "@/api/security/securityDeposits.api";
import {
  useDeleteDepositDocumentMutation,
  useDepositQuery,
  useKeepDepositMutation,
  useLogDepositShareMutation,
  usePlanDepositMutation,
  useUploadDepositDocumentMutation,
} from "@/queries/security/useSecurityDeposits";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { DepositDetail, DepositDocument, DepositHistoryItem } from "@/types/domain/security-deposits.types";
import { DepositModal, DepositSheet, ModalHeader, combineImages, inputCls, pronoun, readAsDataUrl, waLink } from "./deposit-shared";
import { Initials, dayMon } from "./deposits-overview";

const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?am$/i, " AM").replace(/\s?pm$/i, " PM") : "";
const docDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");
const kb = (n: number | null) => (n == null ? "" : n > 1_000_000 ? `${(n / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1000))} KB`);

const ICON: Record<DepositHistoryItem["type"], React.ReactNode> = {
  requested: <CalendarDays />,
  deposit: <Banknote />,
  refund: <RefreshCw />,
  kept: <TriangleAlert />,
  adjustment: <Pencil />,
  plan: <Info />,
  reminder: <MessageCircle />,
};

/** Figma 09.02 · Deposit history sheet. */
export function DepositHistorySheet({ bookingId, onClose, onReturn, onCollect }: { bookingId: string | null; onClose: () => void; onReturn: (id: string) => void; onCollect: (id: string) => void }) {
  return (
    <DepositSheet open={Boolean(bookingId)} onOpenChange={(o) => !o && onClose()}>
      {bookingId ? <Body bookingId={bookingId} onReturn={onReturn} onCollect={onCollect} /> : null}
    </DepositSheet>
  );
}

function Body({ bookingId, onReturn, onCollect }: { bookingId: string; onReturn: (id: string) => void; onCollect: (id: string) => void }) {
  const token = useAuthStore((s) => s.token);
  const { data, isLoading } = useDepositQuery(bookingId);
  const [adjust, setAdjust] = useState(false);
  const [keep, setKeep] = useState(false);
  const upload = useUploadDepositDocumentMutation();
  const remove = useDeleteDepositDocumentMutation();
  const fileRef = useRef<HTMLInputElement>(null);

  if (isLoading || !data) {
    return (
      <>
        <Dialog.Title className="sr-only">Deposit history</Dialog.Title>
        <div className="flex flex-1 items-center justify-center p-10"><Loader2 className="size-6 animate-spin text-ink-3" aria-hidden /></div>
      </>
    );
  }
  const d = data.deposit;
  const m = (n: number) => formatMoney(n, d.currency);
  const rent = data.deductions.filter((x) => x.amount > 0);
  const owed = rent.reduce((s, x) => s + x.amount, 0);
  const leaving = d.status === "leaving";
  const alert =
    d.status === "not_paid"
      ? `${m(d.left_to_collect)} deposit has not been collected yet.`
      : d.status === "part_paid"
        ? `${m(d.left_to_collect)} of the ${m(d.required)} deposit is still to collect.`
        : d.held > 0 && owed > 0
          ? `${m(owed)} ${rent.length === 1 ? rent[0].label.replace(/^Unpaid /, "") : "rent and extras"} ${rent.length === 1 ? "is" : "are"} unpaid — it will be taken from the deposit at check-out unless ${pronoun(d.gender)} first.`
          : null;
  const sub = [d.room_label, d.living ? (leaving ? `leaves ${dayMon(d.check_out)}` : d.stay_label.toLowerCase()) : `left ${dayMon(d.left_on)}`, d.deposited > 0 ? (d.payer.self ? "paid by resident" : `paid by ${d.payer.name}`) : null].filter(Boolean).join(" · ");

  async function receipt(entryId?: string) {
    if (!token) return;
    toast.promise(downloadDepositReceiptApi(token, bookingId, entryId), { loading: "Preparing receipt…", success: "Downloaded", error: (e) => (e instanceof Error ? e.message : "Download failed") });
  }
  async function openDoc(doc: DepositDocument) {
    if (doc.source === "receipt") return receipt(doc.entry_id);
    if (!token) return;
    try {
      const r = await getDepositDocumentApi(token, bookingId, doc.id);
      const a = Object.assign(document.createElement("a"), { href: r.document.data, download: r.document.name });
      a.click();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open the file");
    }
  }
  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = [...files];
    try {
      if (list.length > 1 && list.every((f) => f.type.startsWith("image/"))) {
        // Several photos → one "Room check-in photos (n)" entry (stacked into a single image).
        const dataUrl = await combineImages(list);
        await upload.mutateAsync({ id: bookingId, input: { name: d.living ? "Room check-in photos" : "Room photos", data: dataUrl, kind: "photos", count: list.length, note: "for damage comparison" } });
      } else {
        for (const f of list) {
          await upload.mutateAsync({ id: bookingId, input: { name: f.name, data: await readAsDataUrl(f), kind: f.type.startsWith("image/") ? "photos" : "other" } });
        }
      }
      toast.success(list.length === 1 ? "Document added" : `${list.length} photos added`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 border-b border-glass-divider px-5 py-4 md:px-6 md:py-5">
        <Initials text={d.initials} size={40} className="bg-transparent text-[13px]" />
        <div className="min-w-0 flex-1">
          <Dialog.Title className="truncate text-[22px] leading-7 font-semibold tracking-tight text-ink md:text-[24px] md:leading-8">{d.name}</Dialog.Title>
          <p className="truncate text-label text-ink-2">{sub}</p>
        </div>
        <Dialog.Close aria-label="Close" className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[12px] bg-glass-inset text-ink hover:brightness-95"><X className="size-4" aria-hidden /></Dialog.Close>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5 md:px-6">
        <div className="grid grid-cols-3 gap-2.5">
          <Stat label="Deposited" value={m(d.deposited)} />
          <Stat label="Held now" value={m(d.held)} />
          <Stat label={d.held > 0 ? "Planned return" : "Returned"} value={m(d.held > 0 ? d.planned_return : d.returned)} />
        </div>
        {alert ? (
          <div className="flex items-start gap-2.5 rounded-[14px] border border-glass-divider bg-glass-inset px-3.5 py-3 text-label text-ink-2">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>{alert}</p>
          </div>
        ) : null}

        <section>
          <p className="mb-3 text-eyebrow font-medium tracking-wide text-ink-3 uppercase">History</p>
          <ol className="flex flex-col">
            {data.history.map((h, i) => (
              <li key={h.id} className="relative flex gap-3 pb-4 last:pb-0">
                {i < data.history.length - 1 ? <span className="absolute top-6 bottom-1 left-[9px] w-px bg-glass-divider" aria-hidden /> : null}
                <span className="flex size-5 shrink-0 items-center justify-center pt-0.5 text-ink-2 [&_svg]:size-3.5">{ICON[h.type]}</span>
                <div className="min-w-0 flex-1 pl-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[15px] leading-5 font-semibold text-ink">{h.title}</p>
                    <p className="shrink-0 text-label text-ink-2">{h.balance == null ? "—" : `Balance ${m(h.balance)}`}</p>
                  </div>
                  {h.detail ? <p className="text-label text-ink-2">{h.detail}</p> : null}
                  <p className="text-label text-ink-2">{h.actor} · {when(h.at)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-eyebrow font-medium tracking-wide text-ink-3 uppercase">Documents</p>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={upload.isPending} className="inline-flex cursor-pointer items-center gap-1 text-label font-medium text-brand-text hover:underline disabled:opacity-60">
              {upload.isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Plus className="size-3.5" aria-hidden />} Add photos or file
            </button>
            <input ref={fileRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={(e) => void addFiles(e.target.files)} />
          </div>
          {data.documents.length === 0 ? <p className="rounded-[14px] bg-glass-inset px-4 py-4 text-label text-ink-3">No documents yet. Add check-in photos to compare damage at check-out.</p> : null}
          <div className="flex flex-col gap-3">
            {data.documents.map((doc) => (
              <div key={doc.id} className="group flex items-center gap-3 rounded-[14px] bg-glass-inset px-3.5 py-3">
                <FileText className="size-4 shrink-0 text-ink-2" aria-hidden />
                <button type="button" onClick={() => void openDoc(doc)} className="min-w-0 flex-1 cursor-pointer text-left">
                  <span className="block truncate text-body font-medium text-ink">{doc.name}</span>
                  <span className="block truncate text-label text-ink-2">{[docDate(doc.at), doc.size ? kb(doc.size) : null, doc.note || null].filter(Boolean).join(" · ")}</span>
                </button>
                {doc.source === "upload" ? (
                  <button type="button" aria-label={`Remove ${doc.name}`} onClick={() => remove.mutate({ id: bookingId, docId: doc.id }, { onError: (e) => toast.error(e instanceof Error ? e.message : "Could not remove") })} className="hidden size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-3 group-hover:flex hover:text-danger"><Trash2 className="size-4" aria-hidden /></button>
                ) : null}
                <button type="button" aria-label={`Download ${doc.name}`} onClick={() => void openDoc(doc)} className="flex size-8 cursor-pointer items-center justify-center rounded-[10px] text-ink-2 hover:bg-glass-3"><Download className="size-4" aria-hidden /></button>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-3 border-t border-glass-divider px-5 py-4 md:px-6">
        {d.held > 0 ? (
          <div className="grid grid-cols-3 gap-2.5">
            <FootBtn icon={<Pencil />} onClick={() => setAdjust(true)}>Adjust</FootBtn>
            <FootBtn icon={<TriangleAlert />} onClick={() => setKeep(true)}>Keep part</FootBtn>
            <FootBtn icon={<Download />} onClick={() => void receipt()}>Receipt</FootBtn>
          </div>
        ) : d.deposited > 0 ? (
          <FootBtn icon={<Download />} onClick={() => void receipt()}>Receipt</FootBtn>
        ) : null}
        {d.held > 0 ? (
          <GlassButton className="h-11 w-full rounded-[14px]" onClick={() => onReturn(bookingId)}><RefreshCw aria-hidden /> Return deposit</GlassButton>
        ) : d.living && d.left_to_collect > 0 ? (
          <GlassButton className="h-11 w-full rounded-[14px]" onClick={() => onCollect(bookingId)}><Banknote aria-hidden /> Collect {m(d.left_to_collect)}</GlassButton>
        ) : null}
      </div>

      <AdjustDialog open={adjust} onOpenChange={setAdjust} data={data} />
      <KeepDialog open={keep} onOpenChange={setKeep} data={data} />
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[14px] bg-glass-inset px-3.5 py-3">
      <p className="truncate text-label text-ink-2">{label}</p>
      <p className="truncate text-[15px] leading-5 font-semibold text-ink">{value}</p>
    </div>
  );
}

function FootBtn({ icon, onClick, children }: { icon: React.ReactNode; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="glass-3 inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[12px] text-label font-medium text-ink hover:brightness-105 [&_svg]:size-4">
      {icon}
      {children}
    </button>
  );
}

/** "Adjust" — set the planned return; can share it with the resident on WhatsApp (logged as a reminder). */
export function AdjustDialog({ open, onOpenChange, data }: { open: boolean; onOpenChange: (o: boolean) => void; data: DepositDetail }) {
  const d = data.deposit;
  const plan = usePlanDepositMutation();
  const share = useLogDepositShareMutation();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [wa, setWa] = useState(false);
  useEffect(() => {
    if (open) {
      setAmount(String(d.planned_return));
      setNote("");
      setWa(false);
    }
  }, [open, d.planned_return]);
  const n = Number(amount);
  const phone = d.payer.phone || d.phone;
  const valid = amount !== "" && Number.isFinite(n) && n >= 0 && n <= d.held;

  function save() {
    plan.mutate(
      { id: d.booking_id, amount: n, note: note.trim() || undefined },
      {
        onSuccess: () => {
          toast.success("Planned return saved");
          if (wa && phone) {
            const ded = d.held - n;
            window.open(waLink(phone, `Assalam o Alaikum ${d.payer.self ? d.name : d.payer.name}. ${formatMoney(n, d.currency)} of the ${formatMoney(d.held, d.currency)} security deposit for ${d.name} will be returned at check-out${ded > 0 ? ` (${formatMoney(ded, d.currency)} deducted${note.trim() ? `: ${note.trim()}` : ""})` : ""}.`), "_blank");
            share.mutate({ id: d.booking_id, input: { what: "return_amount", channel: "whatsapp" } });
          }
          onOpenChange(false);
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save"),
      },
    );
  }

  return (
    <DepositModal open={open} onOpenChange={onOpenChange} width={440}>
      <ModalHeader icon={<Pencil />} title="Adjust planned return" sub={`${d.name} · ${formatMoney(d.held, d.currency)} held`} />
      <div className="flex flex-col gap-4 px-5 py-5 md:px-6">
        <label className="flex flex-col gap-1.5 text-label font-medium text-ink-2">
          Give back at check-out
          <input className={inputCls} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
          <span className="font-normal text-ink-3">{valid ? `${formatMoney(d.held - n, d.currency)} to deduct · ${d.owed > 0 ? `owes ${formatMoney(d.owed, d.currency)}` : "nothing owed"}` : `Up to ${formatMoney(d.held, d.currency)}`}</span>
        </label>
        <label className="flex flex-col gap-1.5 text-label font-medium text-ink-2">
          Reason (saved in history)
          <input className={inputCls} placeholder="e.g. November rent to deduct" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        {phone ? (
          <label className="flex cursor-pointer items-center gap-2.5 text-body text-ink">
            <GlassCheckbox checked={wa} onCheckedChange={setWa} aria-label="Share on WhatsApp" />
            Share with {d.payer.self ? "resident" : d.payer.name} on WhatsApp
          </label>
        ) : null}
      </div>
      <div className="flex justify-end gap-2.5 border-t border-glass-divider px-5 py-4 md:px-6">
        {d.planned_set ? <GlassButton variant="ghost" onClick={() => plan.mutate({ id: d.booking_id, amount: null }, { onSuccess: () => onOpenChange(false) })}>Reset</GlassButton> : null}
        <GlassButton variant="glass" onClick={() => onOpenChange(false)}>Cancel</GlassButton>
        <GlassButton disabled={!valid || plan.isPending} onClick={save}>{plan.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}Save</GlassButton>
      </div>
    </DepositModal>
  );
}

/** "Keep part" — keep money for damage / other charges, with an optional photo. */
export function KeepDialog({ open, onOpenChange, data }: { open: boolean; onOpenChange: (o: boolean) => void; data: DepositDetail }) {
  const d = data.deposit;
  const keep = useKeepDepositMutation();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState<"damage" | "other">("damage");
  const [label, setLabel] = useState("");
  const [photo, setPhoto] = useState<{ data: string; name: string } | null>(null);
  useEffect(() => {
    if (open) {
      setAmount("");
      setLabel("");
      setPhoto(null);
      setReason("damage");
    }
  }, [open]);
  const n = Number(amount);
  const valid = n > 0 && n <= d.held && label.trim().length > 0;
  return (
    <DepositModal open={open} onOpenChange={onOpenChange} width={440}>
      <ModalHeader icon={<TriangleAlert />} title="Keep part of deposit" sub={`${d.name} · ${formatMoney(d.held, d.currency)} held`} />
      <div className="flex flex-col gap-4 px-5 py-5 md:px-6">
        <div className="flex gap-2">
          {(["damage", "other"] as const).map((r) => (
            <button key={r} type="button" aria-pressed={reason === r} onClick={() => setReason(r)} className={cn("h-9 cursor-pointer rounded-[12px] border px-3.5 text-body", reason === r ? "border-ink-2 bg-glass-3 font-medium text-ink" : "border-transparent bg-glass-inset text-ink-2")}>{r === "damage" ? "Damage" : "Other charge"}</button>
          ))}
        </div>
        <label className="flex flex-col gap-1.5 text-label font-medium text-ink-2">
          What for
          <input className={inputCls} placeholder={reason === "damage" ? "e.g. Broken chair" : "e.g. Lost key"} value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label className="flex flex-col gap-1.5 text-label font-medium text-ink-2">
          Amount to keep
          <input className={inputCls} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} placeholder={`Up to ${formatMoney(d.held, d.currency)}`} />
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-label font-medium text-brand-text">
          <Plus className="size-3.5" aria-hidden />
          {photo ? photo.name : "Add photo (optional)"}
          <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { setPhoto({ data: await readAsDataUrl(f), name: f.name }); } catch (err) { toast.error(err instanceof Error ? err.message : "Could not read the photo"); } }} />
        </label>
      </div>
      <div className="flex justify-end gap-2.5 border-t border-glass-divider px-5 py-4 md:px-6">
        <GlassButton variant="glass" onClick={() => onOpenChange(false)}>Cancel</GlassButton>
        <GlassButton
          disabled={!valid || keep.isPending}
          onClick={() =>
            keep.mutate(
              { id: d.booking_id, input: { amount: n, reason, reason_label: label.trim(), photo: photo?.data, photo_name: photo?.name } },
              { onSuccess: () => { toast.success(`${formatMoney(n, d.currency)} kept`); onOpenChange(false); }, onError: (e) => toast.error(e instanceof Error ? e.message : "Could not save") },
            )
          }
        >
          {keep.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}Keep {n > 0 ? formatMoney(n, d.currency) : ""}
        </GlassButton>
      </div>
    </DepositModal>
  );
}
