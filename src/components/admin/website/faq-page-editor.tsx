import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { emptyFaqItem, type FaqItem } from "@/lib/faqs";
import type { FaqPageForm } from "@/lib/website-faq";

type FaqPageEditorProps = {
  value: FaqPageForm;
  onChange: <K extends keyof FaqPageForm>(key: K, value: FaqPageForm[K]) => void;
};

function FaqItemEditor({
  index,
  item,
  canRemove,
  onUpdate,
  onRemove,
}: {
  index: number;
  item: FaqItem;
  canRemove: boolean;
  onUpdate: (patch: Partial<FaqItem>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Question {index}</p>
        {canRemove ? (
          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        ) : null}
      </div>
      <div className="grid gap-3">
        <div className="grid gap-1.5">
          <Label>Question</Label>
          <Input value={item.q} onChange={(e) => onUpdate({ q: e.target.value })} />
        </div>
        <div className="grid gap-1.5">
          <Label>Answer</Label>
          <Textarea rows={3} value={item.a} onChange={(e) => onUpdate({ a: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

export function FaqPageEditor({ value, onChange }: FaqPageEditorProps) {
  function updateFaq(index: number, patch: Partial<FaqItem>) {
    onChange(
      "faqs",
      value.faqs.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeFaq(index: number) {
    onChange(
      "faqs",
      value.faqs.filter((_, i) => i !== index),
    );
  }

  function addFaq() {
    onChange("faqs", [...value.faqs, emptyFaqItem()]);
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
              value={value.faqBadgeText}
              onChange={(e) => onChange("faqBadgeText", e.target.value)}
              placeholder="FAQ"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label>Title (before accent)</Label>
              <Input
                value={value.faqTitleLine1}
                onChange={(e) => onChange("faqTitleLine1", e.target.value)}
                placeholder="Frequently asked"
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Title accent</Label>
              <Input
                value={value.faqTitleAccent}
                onChange={(e) => onChange("faqTitleAccent", e.target.value)}
                placeholder="questions."
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label>Intro text</Label>
            <Textarea
              rows={2}
              value={value.faqIntro}
              onChange={(e) => onChange("faqIntro", e.target.value)}
              placeholder="Can't find what you're looking for? Get in touch — we usually reply within a few hours."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Questions & answers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {value.faqs.map((item, index) => (
            <FaqItemEditor
              key={index}
              index={index + 1}
              item={item}
              canRemove={value.faqs.length > 1}
              onUpdate={(patch) => updateFaq(index, patch)}
              onRemove={() => removeFaq(index)}
            />
          ))}
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={addFaq}>
            <Plus className="h-4 w-4" />
            Add question
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-base">Bottom call-to-action</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label>Button label</Label>
            <Input
              value={value.faqCtaLabel}
              onChange={(e) => onChange("faqCtaLabel", e.target.value)}
              placeholder="Still have a question? Contact us"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Button link</Label>
            <Input
              value={value.faqCtaHref}
              onChange={(e) => onChange("faqCtaHref", e.target.value)}
              placeholder="/contact"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
