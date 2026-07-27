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
import { Building2, Loader2, Palette, Share2, BedDouble, Image as ImageIcon, X, LayoutDashboard, UserRound } from "lucide-react";
import { SettingsPageSkeleton } from "@/components/admin/admin-page-skeletons";
import { AdminProfileSettingsCard } from "@/components/admin/admin-profile-settings-card";
import { toast } from "sonner";
import { usePropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useUpdatePropertySettingsMutation } from "@/queries/settings/useUpdatePropertySettingsMutation";
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR } from "@/lib/brand-colors";
import {
  DEFAULT_DASHBOARD_ACCENT_COLOR,
  DEFAULT_DASHBOARD_PRIMARY_COLOR,
} from "@/lib/dashboard-theme";
import type { PropertySettings } from "@/types/domain/property-settings.types";
import { HOMEPAGE_HERO_DEFAULTS } from "@/lib/homepage-hero-defaults";
import { HOMEPAGE_CTA_DEFAULTS } from "@/lib/homepage-cta-defaults";
import { ABOUT_PAGE_DEFAULTS } from "@/lib/about-page-defaults";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

type SettingsForm = Omit<PropertySettings, "whatsapp_url" | "fullAddress">;

const DEFAULTS: SettingsForm = {
  hotelName: "Stay Inn Hostels",
  tagline: "Live your journey, stay with us",
  description:
    "A modern hostel offering comfortable shared and private rooms in the heart of the city.",
  email: "info@stayinnhostels.com",
  phone: "+92 331 0008196",
  address: "Lahore",
  city: "Punjab",
  country: "Pakistan",
  mapUrl: "",
  logoUrl: "",
  coverImageUrl: "",
  primaryColor: DEFAULT_PRIMARY_COLOR,
  accentColor: DEFAULT_ACCENT_COLOR,
  dashboardPrimaryColor: DEFAULT_DASHBOARD_PRIMARY_COLOR,
  dashboardAccentColor: DEFAULT_DASHBOARD_ACCENT_COLOR,
  whatsapp: "923310008196",
  website: "https://stayinnhostels.com",
  instagram: "",
  facebook: "",
  twitter: "",
  youtube: "",
  linkedin: "",
  threads: "",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  minStay: 1,
  maxStay: 30,
  advanceBookingDays: 365,
  cancellationWindowHours: 48,
  cancellationPolicy: "moderate",
  depositPercent: 25,
  allowChildren: true,
  allowPets: false,
  smokingAllowed: false,
  houseRules:
    "• No loud music after 10pm\n• Keep common areas clean\n• Be respectful of other guests\n• ID required at check-in",
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  roomsFilterMinPrice: 3000,
  roomsFilterMaxPrice: 50000,
  ...HOMEPAGE_HERO_DEFAULTS,
  ...HOMEPAGE_CTA_DEFAULTS,
  ...ABOUT_PAGE_DEFAULTS,
};

function toFormSettings(data: PropertySettings): SettingsForm {
  const { whatsapp_url: _u, fullAddress: _f, ...rest } = data;
  const form = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS) as (keyof SettingsForm)[]) {
    const value = rest[key];
    if (value !== undefined) {
      (form as Record<string, unknown>)[key] = value;
    }
  }
  return { ...form, whatsapp: rest.whatsapp ?? "" };
}

function SettingsPage() {
  const { data, isLoading, isError } = usePropertySettingsQuery();
  const saveMutation = useUpdatePropertySettingsMutation();
  const [s, setS] = useState<SettingsForm>(DEFAULTS);

  useEffect(() => {
    if (data) setS(toFormSettings(data));
  }, [data]);

  function update<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setS((prev) => ({ ...prev, [key]: value }));
  }

  function save() {
    saveMutation.mutate(s, {
      onSuccess: () =>
        toast.success("Settings saved — property, branding, and booking rules updated"),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save settings"),
    });
  }

  function reset() {
    setS(DEFAULTS);
    toast.info("Reset to defaults — click Save to apply on the server");
  }

  function uploadImage(file: File | null, key: "logoUrl" | "coverImageUrl") {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => update(key, r.result as string);
    r.readAsDataURL(file);
  }

  if (isLoading && !data) {
    return <SettingsPageSkeleton />;
  }

  if (isError && !data) {
    return (
      <p className="text-sm text-destructive py-8">
        Could not load settings. Check that you are signed in and the API is running.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="profile"><UserRound className="h-3.5 w-3.5" /> Profile</TabsTrigger>
          <TabsTrigger value="property"><Building2 className="h-3.5 w-3.5" /> Property</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="h-3.5 w-3.5" /> Branding</TabsTrigger>
          <TabsTrigger value="dashboard"><LayoutDashboard className="h-3.5 w-3.5" /> Dashboard</TabsTrigger>
          <TabsTrigger value="social"><Share2 className="h-3.5 w-3.5" /> Social</TabsTrigger>
          <TabsTrigger value="booking"><BedDouble className="h-3.5 w-3.5" /> Booking rules</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <AdminProfileSettingsCard />
        </TabsContent>

        <TabsContent value="property" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Property information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2"><Label>Hostel name</Label><Input value={s.hotelName} onChange={(e) => update("hotelName", e.target.value)} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Tagline</Label><Input value={s.tagline} onChange={(e) => update("tagline", e.target.value)} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Short description</Label><Textarea rows={3} value={s.description} onChange={(e) => update("description", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Contact email</Label><Input type="email" value={s.email} onChange={(e) => update("email", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Phone</Label><Input value={s.phone} onChange={(e) => update("phone", e.target.value)} /></div>
              <div className="grid gap-1.5 sm:col-span-2"><Label>Street address</Label><Input value={s.address} onChange={(e) => update("address", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>City</Label><Input value={s.city} onChange={(e) => update("city", e.target.value)} /></div>
              <div className="grid gap-1.5"><Label>Country</Label><Input value={s.country} onChange={(e) => update("country", e.target.value)} /></div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>Map location link</Label>
                <Input
                  type="url"
                  value={s.mapUrl}
                  onChange={(e) => update("mapUrl", e.target.value)}
                  placeholder="Google Maps URL"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Logo & cover</CardTitle>
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
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0] ?? null, "logoUrl")} />
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
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(e.target.files?.[0] ?? null, "coverImageUrl")} />
                    </label>
                    {s.coverImageUrl && <Button variant="ghost" size="sm" onClick={() => update("coverImageUrl", "")}><X className="h-3 w-3" /> Remove</Button>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Website brand colors</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Primary color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={s.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="h-10 w-14 cursor-pointer rounded-md border bg-background" />
                  <Input value={s.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="font-mono" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-fit px-2 text-xs text-muted-foreground"
                  onClick={() => update("primaryColor", DEFAULT_PRIMARY_COLOR)}
                >
                  Reset to default ({DEFAULT_PRIMARY_COLOR})
                </Button>
              </div>
              <div className="grid gap-1.5">
                <Label>Accent color</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={s.accentColor} onChange={(e) => update("accentColor", e.target.value)} className="h-10 w-14 cursor-pointer rounded-md border bg-background" />
                  <Input value={s.accentColor} onChange={(e) => update("accentColor", e.target.value)} className="font-mono" />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-fit px-2 text-xs text-muted-foreground"
                  onClick={() => update("accentColor", DEFAULT_ACCENT_COLOR)}
                >
                  Reset to default ({DEFAULT_ACCENT_COLOR})
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Dashboard theme</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Primary color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={s.dashboardPrimaryColor}
                    onChange={(e) => update("dashboardPrimaryColor", e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-md border bg-background"
                  />
                  <Input
                    value={s.dashboardPrimaryColor}
                    onChange={(e) => update("dashboardPrimaryColor", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-fit px-2 text-xs text-muted-foreground"
                  onClick={() => update("dashboardPrimaryColor", DEFAULT_DASHBOARD_PRIMARY_COLOR)}
                >
                  Reset to default ({DEFAULT_DASHBOARD_PRIMARY_COLOR})
                </Button>
              </div>
              <div className="grid gap-1.5">
                <Label>Accent color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={s.dashboardAccentColor}
                    onChange={(e) => update("dashboardAccentColor", e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-md border bg-background"
                  />
                  <Input
                    value={s.dashboardAccentColor}
                    onChange={(e) => update("dashboardAccentColor", e.target.value)}
                    className="font-mono"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-fit px-2 text-xs text-muted-foreground"
                  onClick={() => update("dashboardAccentColor", DEFAULT_DASHBOARD_ACCENT_COLOR)}
                >
                  Reset to default ({DEFAULT_DASHBOARD_ACCENT_COLOR})
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Preview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md"
                style={{ backgroundColor: s.dashboardPrimaryColor }}
              >
                Primary button
              </button>
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md"
                style={{ backgroundColor: s.dashboardAccentColor }}
              >
                Accent / secondary
              </button>
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ backgroundColor: s.dashboardPrimaryColor }}
              >
                3
              </span>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Social & web</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>WhatsApp number</Label>
                <Input
                  value={s.whatsapp ?? ""}
                  onChange={(e) => update("whatsapp", e.target.value)}
                  placeholder="+92 331 0008196"
                />
              </div>
              <div className="grid gap-1.5 sm:col-span-2">
                <Label>Website</Label>
                <Input value={s.website} onChange={(e) => update("website", e.target.value)} placeholder="https://stayinnhostels.com" />
              </div>
              <div className="grid gap-1.5">
                <Label>Instagram</Label>
                <Input value={s.instagram} onChange={(e) => update("instagram", e.target.value)} placeholder="@username or full URL" />
              </div>
              <div className="grid gap-1.5">
                <Label>YouTube</Label>
                <Input value={s.youtube} onChange={(e) => update("youtube", e.target.value)} placeholder="@channel or full URL" />
              </div>
              <div className="grid gap-1.5">
                <Label>X (Twitter)</Label>
                <Input value={s.twitter} onChange={(e) => update("twitter", e.target.value)} placeholder="@username or full URL" />
              </div>
              <div className="grid gap-1.5">
                <Label>Facebook</Label>
                <Input value={s.facebook} onChange={(e) => update("facebook", e.target.value)} placeholder="username or full URL" />
              </div>
              <div className="grid gap-1.5">
                <Label>LinkedIn</Label>
                <Input value={s.linkedin} onChange={(e) => update("linkedin", e.target.value)} placeholder="company/name or full URL" />
              </div>
              <div className="grid gap-1.5">
                <Label>Threads</Label>
                <Input value={s.threads} onChange={(e) => update("threads", e.target.value)} placeholder="@username or full URL" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="booking" className="space-y-4">
          <Card className="border-border/60 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base">Public booking rules page</CardTitle>
            </CardHeader>
          </Card>

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
                  value={s.roomsFilterMinPrice}
                  onChange={(e) => update("roomsFilterMinPrice", Number(e.target.value))}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Maximum price (PKR)</Label>
                <Input
                  type="number"
                  min={0}
                  step={500}
                  value={s.roomsFilterMaxPrice}
                  onChange={(e) => update("roomsFilterMaxPrice", Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Check-in & check-out</CardTitle>
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
                <Select value={s.cancellationPolicy} onValueChange={(v) => update("cancellationPolicy", v as SettingsForm["cancellationPolicy"])}>
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
                <div><p className="font-semibold">Allow children</p></div>
                <Switch checked={s.allowChildren} onCheckedChange={(v) => update("allowChildren", v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-semibold">Allow pets</p></div>
                <Switch checked={s.allowPets} onCheckedChange={(v) => update("allowPets", v)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div><p className="font-semibold">Smoking allowed</p></div>
                <Switch checked={s.smokingAllowed} onCheckedChange={(v) => update("smokingAllowed", v)} />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-base">House rules</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea rows={6} value={s.houseRules} onChange={(e) => update("houseRules", e.target.value)} className="font-mono text-sm" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 flex justify-end gap-2">
        <Button variant="outline" onClick={reset}>Reset</Button>
        <Button onClick={save} disabled={saveMutation.isPending} className="rounded-full font-semibold shadow-lg">
          {saveMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save settings"
          )}
        </Button>
      </div>
    </div>
  );
}
