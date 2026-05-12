import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  component: SettingsPage,
});

type Settings = {
  hotelName: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  taxPercent: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

const DEFAULTS: Settings = {
  hotelName: "Stay Inn Hostels",
  email: "hello@stayinn.example",
  phone: "+1 555 0100",
  address: "123 Hostel Lane",
  currency: "USD",
  taxPercent: 12,
  emailNotifications: true,
  smsNotifications: false,
};

const STORAGE_KEY = "stayinn.admin.settings";

function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    toast.success("Settings saved");
  }

  return (
    <Tabs defaultValue="general" className="space-y-4">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="financial">Financial</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Hotel information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5"><Label>Hotel name</Label><Input value={s.hotelName} onChange={(e) => setS({ ...s, hotelName: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Email</Label><Input type="email" value={s.email} onChange={(e) => setS({ ...s, email: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Phone</Label><Input value={s.phone} onChange={(e) => setS({ ...s, phone: e.target.value })} /></div>
            <div className="grid gap-1.5 sm:col-span-2"><Label>Address</Label><Textarea rows={2} value={s.address} onChange={(e) => setS({ ...s, address: e.target.value })} /></div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="financial">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Currency & taxes</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Currency</Label>
              <Select value={s.currency} onValueChange={(v) => setS({ ...s, currency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="GBP">GBP (£)</SelectItem>
                  <SelectItem value="INR">INR (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Tax (%)</Label>
              <Input type="number" value={s.taxPercent} onChange={(e) => setS({ ...s, taxPercent: Number(e.target.value) })} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card className="border-border/60">
          <CardHeader><CardTitle className="text-base">Notification preferences</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="font-semibold">Email notifications</p><p className="text-xs text-muted-foreground">Booking confirmations and alerts</p></div>
              <Switch checked={s.emailNotifications} onCheckedChange={(v) => setS({ ...s, emailNotifications: v })} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div><p className="font-semibold">SMS notifications</p><p className="text-xs text-muted-foreground">Critical alerts via text</p></div>
              <Switch checked={s.smsNotifications} onCheckedChange={(v) => setS({ ...s, smsNotifications: v })} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="flex justify-end">
        <Button onClick={save} className="rounded-full font-semibold">Save settings</Button>
      </div>
    </Tabs>
  );
}
