import { useEffect, useMemo, useState } from "react";
import { Banknote, ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GlassButton, GlassSearch } from "@/components/glass";
import { useCollectDepositMutation, useDepositsQuery } from "@/queries/security/useSecurityDeposits";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type { DepositMethod, DepositRow, PayerRelation } from "@/types/domain/security-deposits.types";
import { DepositModal, METHOD_OPTIONS, ModalHeader, Seg, inputCls, todayKey } from "./deposit-shared";
import { DepositStatusPill, Initials } from "./deposits-overview";

const RELATIONS: [PayerRelation, string][] = [
  ["self", "Resident"],
  ["father", "Father"],
  ["mother", "Mother"],
  ["brother", "Brother"],
  ["sister", "Sister"],
  ["guardian", "Guardian"],
  ["spouse", "Spouse"],
  ["company", "Company"],
  ["other", "Other"],
];

/**
 * "Collect" / "Collect deposit": records the deposit (or the rest of a part-paid one) with
 * the method and who paid it. Without a row it first asks who is paying.
 */
export function CollectDepositDialog({ open, row, onClose, hostel, currency }: { open: boolean; row: DepositRow | null; onClose: () => void; hostel?: string; currency: "pkr" | "usd" }) {
  const [picked, setPicked] = useState<DepositRow | null>(row);
  useEffect(() => setPicked(row), [row, open]);
  return (
    <DepositModal open={open} onOpenChange={(o) => !o && onClose()} width={500}>
      {picked ? <Form key={picked.booking_id} row={picked} onBack={row ? undefined : () => setPicked(null)} onClose={onClose} /> : <Picker hostel={hostel} currency={currency} onPick={setPicked} />}
    </DepositModal>
  );
}

function Picker({ hostel, currency, onPick }: { hostel?: string; currency: "pkr" | "usd"; onPick: (r: DepositRow) => void }) {
  const [q, setQ] = useState("");
  const { data, isLoading } = useDepositsQuery({ hostel, currency, scope: "living", limit: 500 });
  const rows = useMemo(() => {
    const all = (data?.deposits ?? []).filter((r) => r.living);
    const s = q.trim().toLowerCase();
    const list = s ? all.filter((r) => `${r.name} ${r.room_label} ${r.phone}`.toLowerCase().includes(s)) : all;
    return list.sort((a, b) => Number(b.left_to_collect > 0) - Number(a.left_to_collect > 0));
  }, [data, q]);
  return (
    <>
      <ModalHeader icon={<Banknote />} title="Collect deposit" sub="Who is paying?" />
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-5 py-4 md:px-6">
        <GlassSearch autoFocus shortcut="" placeholder="Name, room or phone" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Find resident" />
        <div className="-mx-2 flex max-h-[50svh] min-h-[200px] flex-col overflow-y-auto">
          {isLoading ? <Loader2 className="m-auto size-5 animate-spin text-ink-3" aria-hidden /> : null}
          {!isLoading && rows.length === 0 ? <p className="m-auto text-label text-ink-3">No residents with a deposit match.</p> : null}
          {rows.map((r) => (
            <button key={r.booking_id} type="button" onClick={() => onPick(r)} className="flex cursor-pointer items-center gap-3 rounded-[12px] px-2 py-2 text-left hover:bg-glass-inset">
              <Initials text={r.initials} size={32} />
              <span className="min-w-0 flex-1"><span className="block truncate text-body font-medium text-ink">{r.name}</span><span className="block truncate text-label text-ink-3">{r.room_label} · held {formatMoney(r.held, r.currency)}</span></span>
              {r.left_to_collect > 0 ? <span className="text-label font-semibold text-danger">{formatMoney(r.left_to_collect, r.currency)} due</span> : <DepositStatusPill status={r.status} />}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

function Form({ row, onBack, onClose }: { row: DepositRow; onBack?: () => void; onClose: () => void }) {
  const collect = useCollectDepositMutation();
  const m = (n: number) => formatMoney(n, row.currency);
  const needsAgreed = row.required <= 0;
  const [required, setRequired] = useState(needsAgreed ? "" : String(row.required));
  const [amount, setAmount] = useState(row.left_to_collect > 0 ? String(row.left_to_collect) : "");
  const [method, setMethod] = useState<DepositMethod>("cash");
  const [relation, setRelation] = useState<PayerRelation>(row.payer.relation || "self");
  const [payer, setPayer] = useState(row.payer.self ? "" : row.payer.name);
  const [phone, setPhone] = useState(row.payer.self ? "" : row.payer.phone);
  const [date, setDate] = useState(todayKey());
  const [note, setNote] = useState("");
  const n = Number(amount);
  const req = Number(required) || 0;
  const left = Math.max(0, (req || row.required) - row.deposited);
  const valid = n > 0 && (!needsAgreed || req > 0) && (req <= 0 || row.deposited + n <= req) && (relation === "self" || payer.trim().length > 0);

  function save() {
    collect.mutate(
      {
        id: row.booking_id,
        input: {
          amount: n,
          required: req > 0 ? req : undefined,
          method,
          date,
          note: note.trim() || undefined,
          payer_relation: relation,
          payer_name: relation === "self" ? "" : payer.trim(),
          payer_phone: relation === "self" ? "" : phone.trim(),
        },
      },
      {
        onSuccess: (r) => {
          toast.success(`${m(n)} deposit recorded · ${r.reference}`);
          onClose();
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : "Could not record the deposit"),
      },
    );
  }

  return (
    <>
      <div className="flex items-center">
        {onBack ? <button type="button" onClick={onBack} aria-label="Back" className="ml-3 flex size-9 cursor-pointer items-center justify-center rounded-[12px] text-ink-2 hover:bg-glass-inset md:mt-2"><ChevronLeft className="size-4" aria-hidden /></button> : null}
        <div className="min-w-0 flex-1"><ModalHeader icon={onBack ? undefined : <Banknote />} title="Collect deposit" sub={`${row.name} · ${row.room_label}${row.deposited > 0 ? ` · ${m(row.deposited)} paid` : ""}`} /></div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-5 py-5 md:px-6">
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1.5 text-label text-ink-2">
            Agreed deposit
            <input className={inputCls} inputMode="numeric" value={required} onChange={(e) => setRequired(e.target.value.replace(/[^\d.]/g, ""))} placeholder="e.g. 10000" />
          </label>
          <label className="flex flex-col gap-1.5 text-label text-ink-2">
            Amount received
            <input className={inputCls} inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} placeholder={left ? String(left) : "0"} />
          </label>
        </div>
        {req > 0 && n > 0 ? <p className={cn("-mt-2 text-label", row.deposited + n > req ? "text-danger" : "text-ink-3")}>{row.deposited + n > req ? `More than the ${m(req)} agreed` : row.deposited + n < req ? `${m(req - row.deposited - n)} will still be left (part paid)` : "Deposit fully paid"}</p> : null}
        <div className="flex flex-col gap-2">
          <p className="text-label text-ink-2">Method</p>
          <div className="flex flex-wrap gap-2">{METHOD_OPTIONS.map(([k, l]) => <Seg key={k} className="h-9" active={method === k} onClick={() => setMethod(k)}>{l}</Seg>)}</div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <label className="flex flex-col gap-1.5 text-label text-ink-2">
            Paid by
            <select className={inputCls} value={relation} onChange={(e) => setRelation(e.target.value as PayerRelation)}>
              {RELATIONS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1.5 text-label text-ink-2">
            Date
            <input type="date" className={inputCls} value={date} max={todayKey()} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>
        {relation !== "self" ? (
          <div className="grid grid-cols-2 gap-2.5">
            <label className="flex flex-col gap-1.5 text-label text-ink-2">
              {relation === "company" ? "Company name" : "Payer name"}
              <input className={inputCls} value={payer} onChange={(e) => setPayer(e.target.value)} placeholder={relation === "company" ? "e.g. Khan Traders" : "e.g. Iqbal Hussain"} />
            </label>
            <label className="flex flex-col gap-1.5 text-label text-ink-2">
              Payer phone
              <input className={inputCls} inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0300-1234567" />
            </label>
          </div>
        ) : null}
        <label className="flex flex-col gap-1.5 text-label text-ink-2">
          Note
          <input className={inputCls} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" />
        </label>
      </div>
      <div className="flex justify-end gap-2.5 border-t border-glass-divider px-5 py-4 md:px-6">
        <GlassButton variant="glass" onClick={onClose}>Cancel</GlassButton>
        <GlassButton disabled={!valid || collect.isPending} onClick={save}>{collect.isPending ? <Loader2 className="animate-spin" aria-hidden /> : null}Record {n > 0 ? m(n) : "deposit"}</GlassButton>
      </div>
    </>
  );
}
