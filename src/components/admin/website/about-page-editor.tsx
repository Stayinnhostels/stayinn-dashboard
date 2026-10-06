import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ABOUT_VALUE_ICON_OPTIONS } from "@/lib/about-page-defaults";
import { emptyAboutValueCard, type AboutValueCard } from "@/lib/about-values";
import type { AboutPageForm } from "@/lib/website-about";

type AboutPageEditorProps = {
  value: AboutPageForm;
  onChange: <K extends keyof AboutPageForm>(key: K, value: AboutPageForm[K]) => void;
};

function ValueCardEditor({
  index,
  card,
  canRemove,
  onUpdate,
  onRemove,
}: {
  index: number;
  card: AboutValueCard;
  canRemove: boolean;
  onUpdate: (patch: Partial<AboutValueCard>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Value card {index}</p>
        {canRemove ? (
          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Title</Label>
          <Input value={card.title} onChange={(e) => onUpdate({ title: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label>Icon</Label>
          <Select value={card.icon} onValueChange={(v) => onUpdate({ icon: v as AboutValueCard["icon"] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ABOUT_VALUE_ICON_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5 sm:col-span-2">
          <Label>Description</Label>
          <Textarea rows={2} value={card.desc} onChange={(e) => onUpdate({ desc: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

export function AboutPageEditor({ value, onChange }: AboutPageEditorProps) {
  function updateValueCard(index: number, patch: Partial<AboutValueCard>) {
    onChange(
      "aboutValues",
      value.aboutValues.map((card, i) => (i === index ? { ...card, ...patch } : card)),
    );
  }

  function removeValueCard(index: number) {
    onChange(
      "aboutValues",
      value.aboutValues.filter((_, i) => i !== index),
    );
  }

  function addValueCard() {
    onChange("aboutValues", [...value.aboutValues, emptyAboutValueCard()]);
  }

  return (
    <div className="space-y-4">
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Page intro</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5 sm:max-w-xs">
            <Label>Badge text</Label>
            <Input
              value={value.aboutBadgeText}
              onChange={(e) => onChange("aboutBadgeText", e.target.value)}
              placeholder="ABOUT US"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Title line 1</Label>
              <Input
                value={value.aboutTitleLine1}
                onChange={(e) => onChange("aboutTitleLine1", e.target.value)}
                placeholder="Hostel living,"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Title accent (gradient)</Label>
              <Input
                value={value.aboutTitleAccent}
                onChange={(e) => onChange("aboutTitleAccent", e.target.value)}
                placeholder="reimagined."
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Intro paragraph</Label>
            <Textarea rows={3} value={value.aboutIntro} onChange={(e) => onChange("aboutIntro", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Mission</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label>Mission heading</Label>
            <Input
              value={value.aboutMissionHeading}
              onChange={(e) => onChange("aboutMissionHeading", e.target.value)}
              placeholder="Our mission"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Mission paragraph 1</Label>
            <Textarea
              rows={3}
              value={value.aboutMissionParagraph1}
              onChange={(e) => onChange("aboutMissionParagraph1", e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Mission paragraph 2</Label>
            <Textarea
              rows={3}
              value={value.aboutMissionParagraph2}
              onChange={(e) => onChange("aboutMissionParagraph2", e.target.value)}
            />
          </div>
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Stats row</p>
                <p className="text-xs text-muted-foreground">
                  Cards shown next to the mission text on the About page
                </p>
              </div>
              <Switch
                checked={value.aboutShowMissionStats}
                onCheckedChange={(v) => onChange("aboutShowMissionStats", v)}
              />
            </div>
            {value.aboutShowMissionStats ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Stat 1</p>
                  <Input
                    value={value.aboutStat1Value}
                    onChange={(e) => onChange("aboutStat1Value", e.target.value)}
                    placeholder="100+"
                  />
                  <Input
                    value={value.aboutStat1Label}
                    onChange={(e) => onChange("aboutStat1Label", e.target.value)}
                    placeholder="Happy Residents"
                  />
                </div>
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Stat 2</p>
                  <Input
                    value={value.aboutStat2Value}
                    onChange={(e) => onChange("aboutStat2Value", e.target.value)}
                    placeholder="1"
                  />
                  <Input
                    value={value.aboutStat2Label}
                    onChange={(e) => onChange("aboutStat2Label", e.target.value)}
                    placeholder="Locations"
                  />
                </div>
                <div className="space-y-2 rounded-lg border p-3">
                  <p className="text-xs font-semibold text-muted-foreground">Stat 3 (rating)</p>
                  <Input
                    value={value.aboutStat3Value}
                    onChange={(e) => onChange("aboutStat3Value", e.target.value)}
                    placeholder="4.8"
                  />
                  <Input
                    value={value.aboutStat3Label}
                    onChange={(e) => onChange("aboutStat3Label", e.target.value)}
                    placeholder="/5"
                  />
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Brokerage stat</p>
              </div>
              <Switch
                checked={value.aboutShowBrokerage}
                onCheckedChange={(v) => onChange("aboutShowBrokerage", v)}
              />
            </div>
            {value.aboutShowBrokerage ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label>Value</Label>
                  <Input
                    value={value.aboutBrokerageValue}
                    onChange={(e) => onChange("aboutBrokerageValue", e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Label</Label>
                  <Input
                    value={value.aboutBrokerageLabel}
                    onChange={(e) => onChange("aboutBrokerageLabel", e.target.value)}
                    placeholder="Brokerage"
                  />
                </div>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Values section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Section badge</Label>
              <Input
                value={value.aboutValuesBadge}
                onChange={(e) => onChange("aboutValuesBadge", e.target.value)}
                placeholder="VALUES"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Section heading</Label>
              <Input
                value={value.aboutValuesHeading}
                onChange={(e) => onChange("aboutValuesHeading", e.target.value)}
                placeholder="What we stand for"
              />
            </div>
          </div>
          {value.aboutValues.map((card, index) => (
            <ValueCardEditor
              key={index}
              index={index + 1}
              card={card}
              canRemove={value.aboutValues.length > 1}
              onUpdate={(patch) => updateValueCard(index, patch)}
              onRemove={() => removeValueCard(index)}
            />
          ))}
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={addValueCard}>
            <Plus className="h-4 w-4" />
            Add value card
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Bottom call-to-action</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-1.5">
            <Label>Heading</Label>
            <Input
              value={value.aboutCtaHeading}
              onChange={(e) => onChange("aboutCtaHeading", e.target.value)}
              placeholder="Ready to find your seat?"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Description</Label>
            <Textarea
              rows={2}
              value={value.aboutCtaDescription}
              onChange={(e) => onChange("aboutCtaDescription", e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Primary button label</Label>
              <Input
                value={value.aboutCtaPrimaryLabel}
                onChange={(e) => onChange("aboutCtaPrimaryLabel", e.target.value)}
                placeholder="Browse Rooms"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Primary button link</Label>
              <Input
                value={value.aboutCtaPrimaryHref}
                onChange={(e) => onChange("aboutCtaPrimaryHref", e.target.value)}
                placeholder="/rooms"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="font-semibold">Show secondary button</p>
            </div>
            <Switch checked={value.aboutCtaShowSecondary} onCheckedChange={(v) => onChange("aboutCtaShowSecondary", v)} />
          </div>
          {value.aboutCtaShowSecondary ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label>Secondary button label</Label>
                <Input
                  value={value.aboutCtaSecondaryLabel}
                  onChange={(e) => onChange("aboutCtaSecondaryLabel", e.target.value)}
                  placeholder="Contact Us"
                />
              </div>
              <div className="grid gap-1.5">
                <Label>Secondary button link</Label>
                <Input
                  value={value.aboutCtaSecondaryHref}
                  onChange={(e) => onChange("aboutCtaSecondaryHref", e.target.value)}
                  placeholder="/contact"
                />
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
