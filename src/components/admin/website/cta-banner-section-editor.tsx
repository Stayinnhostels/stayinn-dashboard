import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { CtaBannerSectionForm } from "@/lib/website-homepage";

type CtaBannerSectionEditorProps = {
  value: CtaBannerSectionForm;
  onChange: <K extends keyof CtaBannerSectionForm>(key: K, value: CtaBannerSectionForm[K]) => void;
};

export function CtaBannerSectionEditor({ value, onChange }: CtaBannerSectionEditorProps) {
  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Visibility</CardTitle>
          <CardDescription>Show or hide the gradient booking banner at the bottom of the homepage.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-semibold">Show CTA banner</p>
              <p className="text-xs text-muted-foreground">Turn off to remove this section from the homepage.</p>
            </div>
            <Switch checked={value.homeCtaShow} onCheckedChange={(v) => onChange("homeCtaShow", v)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Headline</CardTitle>
          <CardDescription>Large white heading on the left side of the banner.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Title line 1</Label>
            <Input
              value={value.homeCtaTitleLine1}
              onChange={(e) => onChange("homeCtaTitleLine1", e.target.value)}
              placeholder="Your seat is waiting."
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Title line 2</Label>
            <Input
              value={value.homeCtaTitleLine2}
              onChange={(e) => onChange("homeCtaTitleLine2", e.target.value)}
              placeholder="Book in 60 seconds."
            />
          </div>
          <div className="grid gap-1.5 sm:col-span-2">
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={value.homeCtaDescription}
              onChange={(e) => onChange("homeCtaDescription", e.target.value)}
              placeholder="Reserve your bed today with zero deposit…"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Buttons</CardTitle>
          <CardDescription>
            Primary button uses a solid white style; secondary uses an outline. Use paths like{" "}
            <code className="text-xs">/booking</code> or <code className="text-xs">/contact</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Primary button label</Label>
            <Input
              value={value.homeCtaPrimaryLabel}
              onChange={(e) => onChange("homeCtaPrimaryLabel", e.target.value)}
              placeholder="Book Your Seat"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Primary button link</Label>
            <Input
              value={value.homeCtaPrimaryHref}
              onChange={(e) => onChange("homeCtaPrimaryHref", e.target.value)}
              placeholder="/booking"
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3 sm:col-span-2">
            <div>
              <p className="font-semibold">Show secondary button</p>
              <p className="text-xs text-muted-foreground">e.g. Schedule a Visit</p>
            </div>
            <Switch checked={value.homeCtaShowSecondary} onCheckedChange={(v) => onChange("homeCtaShowSecondary", v)} />
          </div>
          {value.homeCtaShowSecondary ? (
            <>
              <div className="grid gap-1.5">
                <Label>Secondary button label</Label>
                <Input
                  value={value.homeCtaSecondaryLabel}
                  onChange={(e) => onChange("homeCtaSecondaryLabel", e.target.value)}
                  placeholder="Schedule a Visit"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Secondary button link</Label>
                <Input
                  value={value.homeCtaSecondaryHref}
                  onChange={(e) => onChange("homeCtaSecondaryHref", e.target.value)}
                  placeholder="/contact"
                />
              </div>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
