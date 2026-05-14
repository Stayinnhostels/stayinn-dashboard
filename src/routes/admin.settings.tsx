import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Palette, Share2, BedDouble, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

type Settings = {
  // Property
  hotelName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  // Branding
  logoUrl: string;
  coverImageUrl: string;
  primaryColor: string;
  accentColor: string;
  // Social
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  // Booking rules
  checkInTime: string;
  checkOutTime: string;
  minStay: number;
  maxStay: number;
  advanceBookingDays: number;
  cancellationWindowHours: number;
  cancellationPolicy: "flexible" | "moderate" | "strict";
  depositPercent: number;
  allowChildren: boolean;
  allowPets: boolean;
  smokingAllowed: boolean;
  // House rules
  houseRules: string;
  quietHoursStart: string;
  quietHoursEnd: string;
};

const DEFAULTS: Settings = {
  hotelName: "Stay Inn Hostels", tagline: "Your home away from home",
  description: "A modern hostel offering comfortable shared and private rooms in the heart of the city.",
  email: "hello@stayinn.example", phone: "+1 555 0100",
  address: "123 Hostel Lane", city: "Mumbai", country: "India",
  logoUrl: "", coverImageUrl: "",
  primaryColor: "#f97316", accentColor: "#0ea5e9",
  website: "https://stayinn.example", instagram: "stayinn", facebook: "stayinn", twitter: "stayinn",
  checkInTime: "14:00", checkOutTime: "11:00",
  minStay: 1, maxStay: 30, advanceBookingDays: 365, cancellationWindowHours: 48,
  cancellationPolicy: "moderate", depositPercent: 25,
  allowChildren: true, allowPets: false, smokingAllowed: false,
  houseRules: "• No loud music after 10pm\n• Keep common areas clean\n• Be respectful of other guests\n• ID required at check-in",
  quietHoursStart: "22:00", quietHoursEnd: "07:00",
};

const STORAGE_KEY = "stayinn.admin.settings.v2";

function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch { /* ignore */ }
  }, []);

  function update<K extends keyof Settings>(key: K, value: Settings[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    toast.success("Settings saved");
  }

  function reset() {
    setS(DEFAULTS);
    toast.info("Reset to defaults — click Save to apply");
  }

  function uploadLogo(file: File | null, key: "logoUrl" | "coverImageUrl") {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => update(key, r.result as string);
    r.readAsDataURL(file);
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="property" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="property"><Building2 className="h-3.5 w-3.5" /> Property</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="h-3.5 w-3.5" /> Branding</TabsTrigger>
          <TabsTrigger value="social"><Share2 className="h-3.5 w-3.5" /> Social</TabsTrigger>
          <TabsTrigger value="booking"><BedDouble className="h-3.5 w-3.5" /> Booking rules</TabsTrigger>
        </TabsList>

        <TabsContent value="property" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Property information</CardTitle>
              <CardDescription>Basic info displayed across your site, invoices and emails.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2"><Label>Hotel name</Label><Input value={s.hotelName} onChange={(e) => update("hotelName", e.target.value)} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Tagline</Label><Input value={s.tagline} onChange={(e) => update("tagline", e.target.value)} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Description</Label><Textarea rows={3} value={s.description} onChange={(e) => update("description", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Contact email</Label><Input type="email" value={s.email} onChange={(e) => update("email", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Phone</Label><Input value={s.phone} onChange={(e) => update("phone", e.target.value)} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Street address</Label><Input value={s.address} onChange={(e) => update("address", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>City</Label><Input value={s.city} onChange={(e) => update("city", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Country</Label><Input value={s.country} onChange={(e) => update("country", e.target.value)} /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Logo & cover</CardTitle>
              <CardDescription>Upload your logo and cover image. PNG or JPG recommended.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="mb-2 block">Logo</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-20 w-20 items-center justify-center rounded-xl border bg-muted">
                    {s.logoUrl ? <img src={s.logoUrl} alt="Logo" className="h-full w-full rounded-xl object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                      Upload logo
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0] ?? null, "logoUrl")} />
                    </label>
                    {s.logoUrl && <Button variant="ghost" size="sm" onClick={() => update("logoUrl", "")}><X className="h-3 w-3" /> Remove</Button>}
                  </div>
                </div>
              </div>
              <div>
                <Label className="mb-2 block">Cover image</Label>
                <div className="flex items-center gap-3">
                  <div className="flex h-20 w-32 items-center justify-center rounded-xl border bg-muted">
                    {s.coverImageUrl ? <img src={s.coverImageUrl} alt="Cover" className="h-full w-full rounded-xl object-cover" /> : <ImageIcon className="h-6 w-6 text-muted-foreground" />}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                      Upload cover
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadLogo(e.target.files?.[0] ?? null, "coverImageUrl")} />
                    </label>
                    {s.coverImageUrl && <Button variant="ghost" size="sm" onClick={() => update("coverImageUrl", "")}><X className="h-3 w-3" /> Remove</Button>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Brand colors</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Primary color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={s.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="h-10 w-14 cursor-pointer rounded-md border bg-background" />
                  <Input value={s.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="font-mono" />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>Accent color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={s.accentColor} onChange={(e) => update("accentColor", e.target.value)} className="h-10 w-14 cursor-pointer rounded-md border bg-background" />
                  <Input value={s.accentColor} onChange={(e) => update("accentColor", e.target.value)} className="font-mono" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Social & web</CardTitle>
              <CardDescription>Links shown in your footer and contact pages.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2"><Label>Website</Label><Input value={s.website} onChange={(e) => update("website", e.target.value)} placeholder="https://" /></div>
              <div className="grid gap-1.5"><Label>Instagram handle</Label><Input value={s.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="username" /></div>
              <div className="grid gap-1.5"><Label>Facebook handle</Label><Input value={s.facebook} onChange={(e) => update("facebook", e.target.value)} placeholder="username" /></div>
              <div className="grid gap-1.5"><Label>X / Twitter handle</Label><Input value={s.twitter} onChange={(e) => update("twitter", e.target.value)} placeholder="username" /></div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Check-in & check-out</CardTitle>
              <CardDescription>Default times shown on bookings and emails.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label>Check-in time</Label><Input type="time" value={s.checkInTime} onChange={(e) => update("checkInTime", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Check-out time</Label><Input type="time" value={s.checkOutTime} onChange={(e) => update("checkOutTime", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Quiet hours start</Label><Input type="time" value={s.quietHoursStart} onChange={(e) => update("quietHoursStart", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Quiet hours end</Label><Input type="time" value={s.quietHoursEnd} onChange={(e) => update("quietHoursEnd", e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Stay rules</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5"><Label>Minimum stay (nights)</Label><Input type="number" min={1} value={s.minStay} onChange={(e) => update("minStay", Number(e.target.value))} /></div>
              <div className="grid gap-1.5"><Label>Maximum stay (nights)</Label><Input type="number" min={1} value={s.maxStay} onChange={(e) => update("maxStay", Number(e.target.value))} /></div>
              <div className="grid gap-1.5"><Label>Advance booking window (days)</Label><Input type="number" min={1} value={s.advanceBookingDays} onChange={(e) => update("advanceBookingDays", Number(e.target.value))} /></div>
              <div className="grid gap-1.5"><Label>Deposit (%)</Label><Input type="number" min={0} max={100} value={s.depositPercent} onChange={(e) => update("depositPercent", Number(e.target.value))} /></div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Cancellation policy</CardTitle></CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Policy</Label>
                <Select value={s.cancellationPolicy} onValueChange={(v) => update("cancellationPolicy", v as Settings["cancellationPolicy"])}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexible">Flexible — full refund 24h before</SelectItem>
                    <SelectItem value="moderate">Moderate — full refund 5 days before</SelectItem>
                    <SelectItem value="strict">Strict — 50% refund up to 7 days before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Free cancellation window (hours)</Label><Input type="number" min={0} value={s.cancellationWindowHours} onChange={(e) => update("cancellationWindowHours", Number(e.target.value))} /></div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader><CardTitle className="text-base">Guest preferences</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-semibold">Allow children</p><p className="text-xs text-muted-foreground">Guests under 18 are welcome</p></div>
                <Switch checked={s.allowChildren} onCheckedChange={(v) => update("allowChildren", v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-semibold">Allow pets</p><p className="text-xs text-muted-foreground">Pets permitted on the property</p></div>
                <Switch checked={s.allowPets} onCheckedChange={(v) => update("allowPets", v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-semibold">Smoking allowed</p><p className="text-xs text-muted-foreground">Smoking permitted in designated areas</p></div>
                <Switch checked={s.smokingAllowed} onCheckedChange={(v) => update("smokingAllowed", v)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">House rules</CardTitle>
              <CardDescription>Shown on booking confirmation and check-in. One per line.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea rows={6} value={s.houseRules} onChange={(e) => update("houseRules", e.target.value)} className="font-mono text-sm" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 flex justify-end gap-2">
        <Button variant="outline" onClick={reset}>Reset</Button>
        <Button onClick={save} className="rounded-full font-semibold shadow-lg">Save settings</Button>
      </div>
    </div>
  );
}
