import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { BookingRulesPageForm } from "@/lib/website-booking-rules";

type BookingRulesPageEditorProps = {
  value: BookingRulesPageForm;
  onChange: <K extends keyof BookingRulesPageForm>(key: K, value: BookingRulesPageForm[K]) => void;
};

export function BookingRulesPageEditor({ value, onChange }: BookingRulesPageEditorProps) {
  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Rooms page price filter</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Minimum price (PKR)</Label>
            <Input
              type="number"
              min={0}
              step={500}
              value={value.roomsFilterMinPrice}
              onChange={(e) => onChange("roomsFilterMinPrice", Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Maximum price (PKR)</Label>
            <Input
              type="number"
              min={0}
              step={500}
              value={value.roomsFilterMaxPrice}
              onChange={(e) => onChange("roomsFilterMaxPrice", Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Check-in & check-out</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Check-in time</Label>
            <Input
              type="time"
              value={value.checkInTime}
              onChange={(e) => onChange("checkInTime", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Check-out time</Label>
            <Input
              type="time"
              value={value.checkOutTime}
              onChange={(e) => onChange("checkOutTime", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Quiet hours start</Label>
            <Input
              type="time"
              value={value.quietHoursStart}
              onChange={(e) => onChange("quietHoursStart", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Quiet hours end</Label>
            <Input
              type="time"
              value={value.quietHoursEnd}
              onChange={(e) => onChange("quietHoursEnd", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Stay rules</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Minimum stay (nights)</Label>
            <Input
              type="number"
              min={1}
              value={value.minStay}
              onChange={(e) => onChange("minStay", Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Maximum stay (nights)</Label>
            <Input
              type="number"
              min={1}
              value={value.maxStay}
              onChange={(e) => onChange("maxStay", Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Advance booking window (days)</Label>
            <Input
              type="number"
              min={1}
              value={value.advanceBookingDays}
              onChange={(e) => onChange("advanceBookingDays", Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Deposit (%)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={value.depositPercent}
              onChange={(e) => onChange("depositPercent", Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Cancellation policy</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Policy</Label>
            <Select
              value={value.cancellationPolicy}
              onValueChange={(v) =>
                onChange("cancellationPolicy", v as BookingRulesPageForm["cancellationPolicy"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flexible">Flexible — full refund 24h before</SelectItem>
                <SelectItem value="moderate">Moderate — full refund 5 days before</SelectItem>
                <SelectItem value="strict">Strict — 50% refund up to 7 days before</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label>Free cancellation window (hours)</Label>
            <Input
              type="number"
              min={0}
              value={value.cancellationWindowHours}
              onChange={(e) => onChange("cancellationWindowHours", Number(e.target.value))}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Guest preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-semibold">Allow children</p>
            </div>
            <Switch checked={value.allowChildren} onCheckedChange={(v) => onChange("allowChildren", v)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-semibold">Allow pets</p>
            </div>
            <Switch checked={value.allowPets} onCheckedChange={(v) => onChange("allowPets", v)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-semibold">Smoking allowed</p>
            </div>
            <Switch checked={value.smokingAllowed} onCheckedChange={(v) => onChange("smokingAllowed", v)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">House rules</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            rows={6}
            value={value.houseRules}
            onChange={(e) => onChange("houseRules", e.target.value)}
            className="font-mono text-sm"
          />
        </CardContent>
      </Card>
    </div>
  );
}
