import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Banknote, CalendarDays, Check, Landmark, Loader2, Plus, RefreshCw, Smartphone, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassCheckbox } from "@/components/glass";
import { useDepositQuery, useLogDepositShareMutation, useReturnDepositMutation } from "@/queries/security/useSecurityDeposits";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { DepositDetail, DepositMethod, ReturnDepositInput } from "@/types/domain/security-deposits.types";
import { DepositModal, ModalHeader, Seg, inputCls, readAsDataUrl, todayKey, waLink } from "./deposit-shared";
import { dayMon } from "./deposits-overview";

type Mode = "full" | "minus" | "custom";
type Charge = { id: number; label: string; amount: string; photo?: { data: string; name: string } };
type GiveTo = { key: string; name: string; phone: string; label: string };

const METHODS: [DepositMethod, string, React.ReactNode, string][] = [
  ["cash", "Cash", <Banknote key="c" />, "Cash"],
  ["jazzcash", "JazzCash", <Smartphone key="j" />, "JazzCash"],
  ["bank_transfer", "Bank transfer", <Landmark key="b" />, "Bank"],
];

/** Figma 09.03 Return deposit (desktop dialog) / 09.05 (mobile bottom sheet). */
export function ReturnDepositDialog({ bookingId, onClose, onDone }: { bookingId: string | null; onClose: () => void; onDone?: () => void }) {
  const { data } = useDepositQuery(bookingId);
  return (
    <DepositModal open={Boolean(bookingId)} onOpenChange={(o) => !o && onClose()} width={720}>
      {data && bookingId === data.deposit.booking_id ? <Form key={bookingId} data={data} onClose={onClose} onDone={onDone} /> : <div className="flex h-60 items-center justify-center"><Dialog.Title className="sr-only">Return deposit</Dialog.Title><Loader2 className="size-6 animate-spin text-ink-3" aria-hidden /></div>}
    </DepositModal>
  );
}

function Form({ data, onClose, onDone }: { data: DepositDetail; onClose: () => void; onDone?: () => void }) {
  const d = data.deposit;
  const mobile = useIsMobile();
  const m = (n: number) => formatMoney(n, d.currency);
  const ret = useReturnDepositMutation();
  const share = useLogDepositShareMutation();

  const owedKeys = data.deductions.filter((x) => x.amount > 0 && x.selected).map((x) => x.key);
  const [mode, setMode] = useState<Mode>(owedKeys.length ? "minus" : "full");
  const [picked, setPicked] = useState<string[]>(owedKeys);
  const [charges, setCharges] = useState<Charge[]>([]);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState<DepositMethod>("cash");
  const giveTo: GiveTo[] = useMemo(() => {
    const out: GiveTo[] = [];
    if (!d.payer.self && d.payer.name) out.push({ key: "payer", name: d.payer.name, phone: d.payer.phone, label: `${d.payer.name} (payer)` });
    out.push({ key: "resident", name: d.name, phone: d.phone, label: `${d.name} (resident)` });
    if (data.guardian.name && data.guardian.name !== d.payer.name) out.push({ key: "guardian", name: data.guardian.name, phone: data.guardian.phone, label: `${data.guardian.name} (guardian)` });
    return out;
  }, [d, data.guardian]);
  const [to, setTo] = useState(giveTo[0].key);
  const [date, setDate] = useState(() => (d.check_out && d.check_out >= todayKey() && d.status === "leaving" ? d.check_out : todayKey()));
  const [note, setNote] = useState("");
  const [email, setEmail] = useState(Boolean(d.email) && !d.email.endsWith("@stayinn.internal"));
  const [wa, setWa] = useState(true);

  const chargeTotal = charges.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const deductionTotal = mode === "full" ? 0 : data.deductions.filter((x) => picked.includes(x.key)).reduce((s, x) => s + x.amount, 0) + chargeTotal;
  const minusAmount = Math.max(0, d.held - deductionTotal);
  const giveBack = mode === "full" ? d.held : mode === "minus" ? minusAmount : Math.min(Number(custom) || 0, minusAmount);
  const over = mode === "custom" && (Number(custom) || 0) > minusAmount;
  const who = giveTo.find((g) => g.key === to) ?? giveTo[0];
  const valid = !over && (giveBack > 0 || deductionTotal > 0) && charges.every((c) => c.label.trim() && Number(c.amount) > 0);

  function submit() {
    const input: ReturnDepositInput = {
      amount: giveBack,
      deductions:
        mode === "full"
          ? []
          : [
              ...data.deductions
                .filter((x) => picked.includes(x.key) && x.amount > 0)
                .map((x) => (x.kind === "extra" ? { kind: "extra" as const, extra_id: x.extra_id!, month: x.month, amount: x.amount, label: x.label } : { kind: "rent" as const, month: x.month, amount: x.amount, label: x.label })),
              ...charges.map((c) => ({ kind: "charge" as const, label: c.label.trim(), amount: Number(c.amount), reason: "damage" as const, photo: c.photo?.data, photo_name: c.photo?.name })),
            ],
      method: giveBack > 0 ? method : undefined,
      give_to_name: who.name,
      give_to_phone: who.phone || undefined,
      date,
      note: note.trim() || undefined,
      email_receipt: email,
    };
    ret.mutate(
      { id: d.booking_id, input },
      {
        onSuccess: (r) => {
          toast.success(giveBack > 0 ? `${m(giveBack)} returned to ${who.name}${r.emailed ? " · receipt emailed" : ""}` : `${m(deductionTotal)} taken from the deposit`);
          if (wa && who.phone && giveBack > 0) {
            const ded = deductionTotal > 0 ? ` ${m(deductionTotal)} was deducted (${[...data.deductions.filter((x) => picked.includes(x.key)).map((x) => x.label), ...charges.map((c) => c.label)].join(", ")}).` : "";
            window.open(waLink(who.phone, `Assalam o Alaikum ${who.name}. ${m(giveBack)} of the security deposit for ${d.name} has been returned by ${METHODS.find((x) => x[0] === method)?.[1] ?? method}.${ded} Receipt ${r.reference}. Thank you!`), "_blank");
            share.mutate({ id: d.booking_id, input: { what: "receipt", channel: "whatsapp" } });
          }
          onClose();
          onDone?.();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not return the deposit"),
      },
    );
  }

  const addCharge = () => setCharges((c) => [...c, { id: Date.now(), label: "", amount: "" }]);
  const toggle = (key: string) => setPicked((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  const chargeRows = charges.map((c) => (
    <div key={c.id} className="flex items-center gap-2">
      <input className={cn(inputCls, "h-9 flex-1")} placeholder="Damage or charge" value={c.label} onChange={(e) => setCharges((cs) => cs.map((x) => (x.id === c.id ? { ...x, label: e.target.value } : x)))} />
      <input className={cn(inputCls, "h-9 w-24")} inputMode="numeric" placeholder="Amount" value={c.amount} onChange={(e) => setCharges((cs) => cs.map((x) => (x.id === c.id ? { ...x, amount: e.target.value.replace(/[^\d.]/g, "") } : x)))} />
      <label className={cn("flex h-9 shrink-0 cursor-pointer items-center rounded-[10px] px-2 text-label", c.photo ? "text-brand-text" : "text-ink-2 hover:bg-glass-3")} title={c.photo?.name ?? "Add photo"}>
        {c.photo ? <Check className="size-4" aria-hidden /> : "Photo"}
        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { const dataUrl = await readAsDataUrl(f); setCharges((cs) => cs.map((x) => (x.id === c.id ? { ...x, photo: { data: dataUrl, name: f.name } } : x))); } catch (err) { toast.error(err instanceof Error ? err.message : "Could not read the photo"); } }} />
      </label>
      <button type="button" aria-label="Remove charge" onClick={() => setCharges((cs) => cs.filter((x) => x.id !== c.id))} className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-ink-3 hover:text-danger"><Trash2 className="size-4" aria-hidden /></button>
    </div>
  ));

  const options = (
    <div className="grid grid-cols-3 gap-2.5 md:gap-3">
      <AmountOption active={mode === "full"} onClick={() => setMode("full")} title={mobile ? "Full" : "Full amount"} value={m(d.held)} />
      <AmountOption active={mode === "minus"} onClick={() => setMode("minus")} title={mobile ? "Minus owed" : "Minus what's owed"} value={m(minusAmount)} big={!mobile} />
      <AmountOption active={mode === "custom"} onClick={() => setMode("custom")} title={mobile ? "Custom" : "Custom amount"} value={mode === "custom" ? null : mobile ? "—" : "Enter any amount"}>
        {mode === "custom" ? <input autoFocus className="w-full bg-transparent text-[15px] leading-5 font-semibold text-ink outline-none placeholder:font-normal placeholder:text-ink-3 md:text-[22px] md:leading-7" inputMode="numeric" placeholder="0" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, ""))} onClick={(e) => e.stopPropagation()} /> : null}
      </AmountOption>
    </div>
  );

  const sub = mobile ? `${d.name} · ${m(d.held)} held` : `${d.name} · ${d.room_label} · ${m(d.held)} held${data.held_since ? ` since ${dayMon(data.held_since)}` : ""}`;

  if (mobile) {
    const lines = data.deductions.filter((x) => x.amount > 0);
    return (
      <>
        <ModalHeader title="Return deposit" sub={sub} />
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 pt-1 pb-3">
          {options}
          {lines.map((x) => (
            <label key={x.key} className={cn("flex min-h-12 cursor-pointer items-center gap-3 rounded-[14px] bg-glass-inset px-3.5", mode === "full" && "opacity-50")}>
              <GlassCheckbox checked={mode !== "full" && picked.includes(x.key)} disabled={mode === "full"} onCheckedChange={() => toggle(x.key)} aria-label={x.label} />
              <span className="min-w-0 flex-1 truncate text-body text-ink">{x.label}</span>
              <span className="text-body font-semibold text-ink">– {m(x.amount)}</span>
            </label>
          ))}
          {chargeRows}
          <button type="button" onClick={addCharge} disabled={mode === "full"} className="inline-flex cursor-pointer items-center gap-2 self-start px-1 text-label font-medium text-brand-text disabled:opacity-50"><Plus className="size-4" aria-hidden /> Add damage charge</button>
          <div className="flex items-center justify-between px-3.5 py-2">
            <span className="text-body font-medium text-ink">Give back</span>
            <span className="text-[24px] leading-8 font-semibold tracking-tight text-ink">{m(giveBack)}</span>
          </div>
          {over ? <p className="-mt-2 px-3.5 text-label text-danger">Up to {m(minusAmount)} after deductions</p> : null}
          <div className="grid grid-cols-3 gap-2.5">
            {METHODS.map(([k, , , short]) => <Seg key={k} active={method === k} onClick={() => setMethod(k)}>{short}</Seg>)}
          </div>
          <input className={cn(inputCls, "h-11")} placeholder="Note: rest returned to father" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        <div className="px-5 pt-1 pb-5">
          <GlassButton className="h-12 w-full rounded-[16px]" disabled={!valid || ret.isPending} onClick={submit}>
            {ret.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
            {giveBack > 0 ? `Return ${m(giveBack)}${email || (wa && who.phone) ? " & send receipt" : ""}` : `Take ${m(deductionTotal)} from deposit`}
          </GlassButton>
        </div>
      </>
    );
  }

  return (
    <>
      <ModalHeader icon={<RefreshCw />} title="Return deposit" sub={sub} />
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-6 pt-6 pb-6">
        <section className="flex flex-col gap-3">
          <p className="text-body font-medium text-ink">How much to give back?</p>
          {options}
        </section>

        <div className="grid grid-cols-[minmax(0,1fr)_250px] gap-4">
          <div className={cn("flex flex-col gap-3 rounded-[18px] border border-glass-divider bg-glass-inset p-4", mode === "full" && "opacity-60")}>
            <p className="text-eyebrow font-medium tracking-wide text-ink-2 uppercase">Deductions</p>
            {data.deductions.length === 0 && charges.length === 0 ? <p className="text-label text-ink-3">Nothing owed — rent and extras are paid.</p> : null}
            {data.deductions.map((x) => {
              const on = mode !== "full" && picked.includes(x.key) && x.amount > 0;
              return (
                <label key={x.key} className={cn("flex items-start gap-3", x.amount > 0 && mode !== "full" ? "cursor-pointer" : "cursor-default")}>
                  <GlassCheckbox className="mt-0.5" checked={on} disabled={x.amount <= 0 || mode === "full"} onCheckedChange={() => toggle(x.key)} aria-label={x.label} />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-body", x.amount > 0 ? "font-medium text-ink" : "text-ink-2")}>{x.label}</span>
                    <span className="block truncate text-label text-ink-2">{x.sub}</span>
                  </span>
                  <span className={cn("pt-0.5 text-body whitespace-nowrap", on ? "font-semibold text-ink" : "text-ink-2")}>{x.amount > 0 ? `– ${m(x.amount)}` : m(0)}</span>
                </label>
              );
            })}
            {chargeRows}
            <button type="button" onClick={addCharge} disabled={mode === "full"} className="inline-flex cursor-pointer items-center gap-2 self-start text-label font-medium text-brand-text hover:underline disabled:cursor-default disabled:no-underline"><Plus className="size-4" aria-hidden /> Add damage or other charge (with photo)</button>
          </div>
          <div className="flex h-fit flex-col gap-3 rounded-[18px] border border-glass-divider bg-glass-inset p-4">
            <p className="text-eyebrow font-medium tracking-wide text-ink-2 uppercase">Summary</p>
            <div className="flex justify-between text-body"><span className="text-ink-2">Held</span><span className="font-semibold text-ink">{m(d.held)}</span></div>
            <div className="flex justify-between text-body"><span className="text-ink-2">Deductions</span><span className="font-semibold text-ink">{deductionTotal > 0 ? `– ${m(deductionTotal)}` : m(0)}</span></div>
            {mode === "custom" && giveBack < minusAmount ? <div className="flex justify-between text-body"><span className="text-ink-2">Stays held</span><span className="font-semibold text-ink">{m(minusAmount - giveBack)}</span></div> : null}
            <div className="flex items-center justify-between border-t border-glass-divider pt-3">
              <span className="text-body font-semibold text-ink">Give back</span>
              <span className="text-[24px] leading-8 font-semibold tracking-tight text-ink">{m(giveBack)}</span>
            </div>
            {over ? <p className="text-label text-danger">Up to {m(minusAmount)} after deductions</p> : null}
          </div>
        </div>

        <section className={cn("flex flex-col gap-2.5", giveBack <= 0 && "opacity-50")}>
          <p className="text-body font-medium text-ink">Refund method</p>
          <div className="flex flex-wrap gap-2.5">
            {METHODS.map(([k, l, icon]) => <Seg key={k} active={method === k} onClick={() => setMethod(k)}>{icon}{l}</Seg>)}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1.5 text-label text-ink-2">
            Give to
            <span className="relative">
              <UsersRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-2" aria-hidden />
              <select className={cn(inputCls, "appearance-none pl-10")} value={to} onChange={(e) => setTo(e.target.value)}>
                {giveTo.map((g) => <option key={g.key} value={g.key}>{g.label}{g.phone ? ` · ${g.phone}` : ""}</option>)}
              </select>
            </span>
          </label>
          <label className="flex flex-col gap-1.5 text-label text-ink-2">
            Date
            <span className="relative">
              <CalendarDays className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-2" aria-hidden />
              <input type="date" className={cn(inputCls, "pl-10")} value={date} onChange={(e) => setDate(e.target.value)} />
            </span>
          </label>
        </div>
        <label className="flex flex-col gap-1.5 text-label text-ink-2">
          Note (saved in history)
          <input className={inputCls} placeholder="e.g. Rent balance deducted, rest returned to father by JazzCash" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>

      <div className="flex items-center gap-4 border-t border-glass-divider px-6 py-4">
        <label className={cn("flex items-center gap-2 text-body text-ink", d.email ? "cursor-pointer" : "opacity-50")} title={d.email ? d.email : "No email on file"}>
          <GlassCheckbox checked={email} disabled={!d.email || d.email.endsWith("@stayinn.internal")} onCheckedChange={setEmail} aria-label="Email receipt" /> Email receipt
        </label>
        <label className={cn("flex items-center gap-2 text-body text-ink", who.phone ? "cursor-pointer" : "opacity-50")} title={who.phone || "No phone on file"}>
          <GlassCheckbox checked={wa && Boolean(who.phone)} disabled={!who.phone} onCheckedChange={setWa} aria-label="WhatsApp" /> WhatsApp
        </label>
        <span className="flex-1" />
        <GlassButton variant="glass" onClick={onClose}>Cancel</GlassButton>
        <GlassButton disabled={!valid || ret.isPending} onClick={submit}>
          {ret.isPending ? <Loader2 className="animate-spin" aria-hidden /> : <Check aria-hidden />}
          {giveBack > 0 ? `Return ${m(giveBack)}` : `Take ${m(deductionTotal)}`}
        </GlassButton>
      </div>
    </>
  );
}

function AmountOption({ active, onClick, title, value, big, children }: { active: boolean; onClick: () => void; title: string; value: string | null; big?: boolean; children?: React.ReactNode }) {
  return (
    <div
      role="radio"
      aria-checked={active}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onClick()}
      className={cn(
        "relative flex min-h-[60px] cursor-pointer flex-col justify-center gap-0.5 rounded-[14px] border px-3.5 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-brand-border md:min-h-[74px] md:gap-1 md:rounded-[16px] md:px-4",
        active ? "border-ink-2 bg-glass-3" : "border-glass-divider bg-glass-inset",
      )}
    >
      <span className={cn("text-label md:text-body", active ? "text-ink" : "text-ink-2")}>{title}</span>
      {active ? <Check className="absolute top-3.5 right-3.5 hidden size-4 text-ink md:block" aria-hidden /> : null}
      {children ?? <span className={cn(active ? "font-semibold text-ink" : "text-ink-2", active && big ? "text-[15px] leading-5 md:text-[22px] md:leading-7" : "text-[15px] leading-5 md:text-body")}>{value}</span>}
    </div>
  );
}
