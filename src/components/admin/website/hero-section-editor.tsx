import { Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { resolveHeroPreviewSrc } from "@/lib/homepage-hero-defaults";
import type { HeroSectionForm } from "@/lib/website-homepage";

type HeroSectionEditorProps = {
  value: HeroSectionForm;
  onChange: <K extends keyof HeroSectionForm>(key: K, value: HeroSectionForm[K]) => void;
  onUploadHeroImage: (file: File | null) => void;
};

export function HeroSectionEditor({ value, onChange, onUploadHeroImage }: HeroSectionEditorProps) {
  const heroPreviewSrc = resolveHeroPreviewSrc(value.heroImageUrl);

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Headline & intro</CardTitle>
          <CardDescription>Main title, gradient tagline, and paragraph under the hero heading.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Hostel name</Label>
            <Input
              value={value.hotelName}
              onChange={(e) => onChange("hotelName", e.target.value)}
              placeholder="Stay Inn Hostels"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Tagline</Label>
            <Input
              value={value.tagline}
              onChange={(e) => onChange("tagline", e.target.value)}
              placeholder="Live your journey, stay with us"
            />
            <p className="text-xs text-muted-foreground">Shown in the gradient accent color next to the hostel name.</p>
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Textarea rows={3} value={value.description} onChange={(e) => onChange("description", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Promo badge</CardTitle>
          <CardDescription>Optional pill above the headline (e.g. &quot;Now booking for 2026&quot;).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-semibold">Show promo badge</p>
              <p className="text-xs text-muted-foreground">Hide if you prefer a cleaner hero.</p>
            </div>
            <Switch checked={value.heroShowBadge} onCheckedChange={(v) => onChange("heroShowBadge", v)} />
          </div>
          {value.heroShowBadge ? (
            <div className="grid gap-1.5">
              <Label>Badge text</Label>
              <Input
                value={value.heroBadgeText}
                onChange={(e) => onChange("heroBadgeText", e.target.value)}
                placeholder="Now booking for 2026"
              />
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Call-to-action buttons</CardTitle>
          <CardDescription>
            Use site paths like <code className="text-xs">/booking</code> or <code className="text-xs">/rooms</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Primary button label</Label>
            <Input
              value={value.heroPrimaryCtaLabel}
              onChange={(e) => onChange("heroPrimaryCtaLabel", e.target.value)}
              placeholder="Book Your Seat"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Primary button link</Label>
            <Input
              value={value.heroPrimaryCtaHref}
              onChange={(e) => onChange("heroPrimaryCtaHref", e.target.value)}
              placeholder="/booking"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Secondary button label</Label>
            <Input
              value={value.heroSecondaryCtaLabel}
              onChange={(e) => onChange("heroSecondaryCtaLabel", e.target.value)}
              placeholder="Explore Rooms"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Secondary button link</Label>
            <Input
              value={value.heroSecondaryCtaHref}
              onChange={(e) => onChange("heroSecondaryCtaHref", e.target.value)}
              placeholder="/rooms"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Hero image</CardTitle>
          <CardDescription>Large photo on the right side of the hero. Leave empty to use the default hostel image.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border bg-muted">
                {heroPreviewSrc ? (
                  <img
                    src={heroPreviewSrc}
                    alt={value.heroImageAlt || "Hero preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full min-h-48 w-full flex-col items-center justify-center gap-2 p-6 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 opacity-40" />
                    <p className="text-sm font-medium text-foreground">No custom hero image</p>
                    <p className="text-xs">Upload a photo here. Until then, the website uses its default hero image.</p>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <label className="inline-flex cursor-pointer items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                  Upload hero image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onUploadHeroImage(e.target.files?.[0] ?? null)}
                  />
                </label>
                {value.heroImageUrl ? (
                  <Button variant="ghost" size="sm" onClick={() => onChange("heroImageUrl", "")}>
                    <X className="h-3 w-3" /> Use default image
                  </Button>
                ) : null}
                <p className="text-xs text-muted-foreground">PNG or JPG. Wide landscape works best.</p>
              </div>
            </div>
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Image alt text</Label>
            <Input
              value={value.heroImageAlt}
              onChange={(e) => onChange("heroImageAlt", e.target.value)}
              placeholder="Modern Stay Inn Hostel common room"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Stats row</CardTitle>
          <CardDescription>Three metrics shown under the buttons (residents, locations, rating).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-semibold">Show stats</p>
              <p className="text-xs text-muted-foreground">Hide the numbers row under the hero CTAs.</p>
            </div>
            <Switch checked={value.heroShowStats} onCheckedChange={(v) => onChange("heroShowStats", v)} />
          </div>
          {value.heroShowStats ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-xs font-semibold text-muted-foreground">Stat 1</p>
                <Input
                  value={value.heroStat1Value}
                  onChange={(e) => onChange("heroStat1Value", e.target.value)}
                  placeholder="2,500+"
                />
                <Input
                  value={value.heroStat1Label}
                  onChange={(e) => onChange("heroStat1Label", e.target.value)}
                  placeholder="Happy Residents"
                />
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-xs font-semibold text-muted-foreground">Stat 2</p>
                <Input
                  value={value.heroStat2Value}
                  onChange={(e) => onChange("heroStat2Value", e.target.value)}
                  placeholder="12"
                />
                <Input
                  value={value.heroStat2Label}
                  onChange={(e) => onChange("heroStat2Label", e.target.value)}
                  placeholder="Locations"
                />
              </div>
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-xs font-semibold text-muted-foreground">Stat 3 (rating)</p>
                <Input
                  value={value.heroStat3Value}
                  onChange={(e) => onChange("heroStat3Value", e.target.value)}
                  placeholder="4.8"
                />
                <Input
                  value={value.heroStat3Label}
                  onChange={(e) => onChange("heroStat3Label", e.target.value)}
                  placeholder="/5"
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Trust badge overlay</CardTitle>
          <CardDescription>Small card on the hero image (e.g. security / verification message).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-semibold">Show trust badge</p>
              <p className="text-xs text-muted-foreground">Floating card on the bottom-left of the hero image.</p>
            </div>
            <Switch checked={value.heroShowTrustBadge} onCheckedChange={(v) => onChange("heroShowTrustBadge", v)} />
          </div>
          {value.heroShowTrustBadge ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Title</Label>
                <Input
                  value={value.heroTrustTitle}
                  onChange={(e) => onChange("heroTrustTitle", e.target.value)}
                  placeholder="Verified Safe"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Subtitle</Label>
                <Input
                  value={value.heroTrustSubtitle}
                  onChange={(e) => onChange("heroTrustSubtitle", e.target.value)}
                  placeholder="24/7 CCTV & Security"
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
