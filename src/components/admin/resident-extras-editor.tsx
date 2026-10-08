import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateResidentMutation } from "@/queries/residents";
import { usePropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useUpdatePropertySettingsMutation } from "@/queries/settings/useUpdatePropertySettingsMutation";
import { formatMoney } from "@/lib/payments";
import { HintTooltip } from "@/components/ui/hint-tooltip";
import { cn } from "@/lib/utils";
import type {
  ExtraBillingCycle,
  RentPaymentStatus,
  ResidentExtra,
} from "@/types/domain/resident.types";
import {
  DEFAULT_EXTRA_FACILITY_PRESETS,
  EXTRA_BILLING_CYCLE_LABELS,
  RENT_PAYMENT_STATUS_LABELS,
} from "@/types/domain/resident.types";

const ADD_FACILITY_VALUE = "__add_facility__";
const RENT_STATUS_OPTIONS = Object.keys(RENT_PAYMENT_STATUS_LABELS) as RentPaymentStatus[];

export function ResidentExtrasEditor({
  bookingId,
  month,
  extras,
  currency,
}: {
  bookingId: string;
  month: string;
  extras: ResidentExtra[];
  currency: "pkr" | "usd";
}) {
  const update = useUpdateResidentMutation();
  const savePresets = useUpdatePropertySettingsMutation();
  const { data: settings } = usePropertySettingsQuery();
  const presets = useMemo(() => {
    if (!settings) return [...DEFAULT_EXTRA_FACILITY_PRESETS];
    if (Array.isArray(settings.extraFacilityPresets)) return settings.extraFacilityPresets;
    return [...DEFAULT_EXTRA_FACILITY_PRESETS];
  }, [settings]);
  const [preset, setPreset] = useState<string>(presets[0] ?? "");
  const [amount, setAmount] = useState("");
  const [cycle, setCycle] = useState<ExtraBillingCycle>("monthly");
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    if (preset && !presets.includes(preset)) {
      setPreset(presets[0] ?? "");
    }
  }, [presets, preset]);

  const busy = update.isPending || savePresets.isPending;

  function persistPresets(next: string[], onSaved?: (saved: string[]) => void) {
    savePresets.mutate(
      { extraFacilityPresets: next },
      {
        onSuccess: (saved) => {
          onSaved?.(saved.extraFacilityPresets ?? next);
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Could not update facilities"),
      },
    );
  }

  function saveNewFacility() {
    const name = newName.trim();
    if (!name) {
      toast.error("Enter a facility name");
      return;
    }
    if (presets.some((item) => item.toLowerCase() === name.toLowerCase())) {
      toast.error("That facility is already in the list");
      return;
    }
    if (presets.length >= 40) {
      toast.error("You can save up to 40 extra facilities");
      return;
    }
    persistPresets([...presets, name], (saved) => {
      const selected = saved.find((item) => item.toLowerCase() === name.toLowerCase()) ?? name;
      setPreset(selected);
      setNewName("");
      setAddOpen(false);
      toast.success(`${selected} added to the list`);
    });
  }

  function removePreset(name: string) {
    persistPresets(
      presets.filter((item) => item !== name),
      () => toast.success(`${name} removed from the list`),
    );
  }

  function addExtra() {
    const value = Number(amount);
    if (!preset) {
      toast.error("Choose a facility");
      return;
    }
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Enter a charge amount");
      return;
    }
    update.mutate(
      {
        bookingId,
        input: {
          month,
          add_extra: {
            label: preset,
            amount: value,
            billing_cycle: cycle,
            start_month: month,
          },
        },
      },
      {
        onSuccess: () => {
          toast.success(`${preset} added — billed separately from rent`);
          setAmount("");
          setCycle("monthly");
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Could not add facility"),
      },
    );
  }

  function setPayment(extra: ResidentExtra, payment_status: RentPaymentStatus) {
    if (!extra.this_month) return;
    if (extra.this_month.payment_status === payment_status) return;
    update.mutate(
      {
        bookingId,
        input: {
          month,
          update_extra: { extra_id: extra.id, payment_status, month },
        },
      },
      {
        onSuccess: () =>
          toast.success(`${extra.label} (${month}): ${RENT_PAYMENT_STATUS_LABELS[payment_status]}`),
        onError: () => toast.error("Could not update extra payment"),
      },
    );
  }

  function removeExtra(extra: ResidentExtra) {
    update.mutate(
      { bookingId, input: { month, remove_extra: extra.id } },
      {
        onSuccess: () => toast.success(`${extra.label} removed`),
        onError: () => toast.error("Could not remove facility"),
      },
    );
  }

  return (
    <div className="space-y-3 sm:col-span-2 rounded-lg border border-border/60 bg-muted/20 px-3 py-3">
      <div>
        <Label>Extra facilities</Label>
        <p className="text-xs text-muted-foreground">
          Extra charges are billed on their own payment cycle — not mixed with rent. Use + Add in the
          Facility list to create a new option.
        </p>
      </div>

      {extras.length === 0 ? (
        <p className="text-xs text-muted-foreground">No extra facilities on this guest yet.</p>
      ) : (
        <div className="space-y-2">
          {extras.map((extra) => (
            <div
              key={extra.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-border/50 bg-background px-2 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{extra.label}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatMoney(extra.this_month?.amount ?? extra.amount, currency)} ·{" "}
                  {EXTRA_BILLING_CYCLE_LABELS[extra.billing_cycle]}
                  {extra.status === "ended" ? " · ended" : ""}
                </p>
              </div>
              {extra.this_month ? (
                <Select
                  value={extra.this_month.payment_status}
                  onValueChange={(v) => setPayment(extra, v as RentPaymentStatus)}
                  disabled={busy}
                >
                  <SelectTrigger className="h-8 w-[8.5rem] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RENT_STATUS_OPTIONS.map((key) => (
                      <SelectItem key={key} value={key}>
                        {RENT_PAYMENT_STATUS_LABELS[key]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <span className="text-[11px] text-muted-foreground">Not billed this month</span>
              )}
              <HintTooltip label="Remove facility">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={busy}
                  aria-label="Remove facility"
                  onClick={() => removeExtra(extra)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </HintTooltip>
            </div>
          ))}
        </div>
      )}

      <div className={cn("grid gap-2 sm:grid-cols-2")}>
        <div className="space-y-1">
          <Label className="text-xs">Facility</Label>
          <Select
            value={preset || undefined}
            onValueChange={(v) => {
              if (v === ADD_FACILITY_VALUE) {
                setNewName("");
                setAddOpen(true);
                return;
              }
              setPreset(v);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select facility" />
            </SelectTrigger>
            <SelectContent>
              {presets.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
              <SelectItem value={ADD_FACILITY_VALUE}>
                <span className="inline-flex items-center gap-1.5 font-medium text-primary">
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Charge</Label>
          <Input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Cycle</Label>
          <Select value={cycle} onValueChange={(v) => setCycle(v as ExtraBillingCycle)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly (separate from rent)</SelectItem>
              <SelectItem value="one_time">One-time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={addExtra}>
        {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
        Add facility
      </Button>

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) setNewName("");
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add extra facility</DialogTitle>
            <DialogDescription>
              This name will appear in the Facility dropdown for every resident.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-extra-facility">Facility name</Label>
            <Input
              id="new-extra-facility"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Microwave"
              maxLength={80}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  saveNewFacility();
                }
              }}
            />
          </div>
          {presets.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Saved facilities</p>
              <ul className="max-h-40 space-y-1 overflow-y-auto">
                {presets.map((name) => (
                  <li
                    key={name}
                    className="flex items-center justify-between gap-2 rounded-md border border-border/60 px-2 py-1.5 text-sm"
                  >
                    <span>{name}</span>
                    <HintTooltip label={`Remove ${name}`}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        disabled={busy}
                        aria-label={`Remove ${name}`}
                        onClick={() => removePreset(name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </HintTooltip>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button type="button" disabled={busy} onClick={saveNewFacility}>
              {savePresets.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
