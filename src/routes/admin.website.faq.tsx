import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CircleHelp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaqPageEditor } from "@/components/admin/website/faq-page-editor";
import { WebsitePageNav } from "@/components/admin/website/website-page-nav";
import { SettingsPageSkeleton } from "@/components/admin/admin-page-skeletons";
import { usePropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useUpdatePropertySettingsMutation } from "@/queries/settings/useUpdatePropertySettingsMutation";
import { FAQ_PAGE_FORM_DEFAULTS, pickFaqPage, type FaqPageForm } from "@/lib/website-faq";

export const Route = createFileRoute("/admin/website/faq")({ component: FaqWebsitePage });

function FaqWebsitePage() {
  const { data, isLoading, isError } = usePropertySettingsQuery();
  const saveMutation = useUpdatePropertySettingsMutation();
  const [faq, setFaq] = useState<FaqPageForm>(FAQ_PAGE_FORM_DEFAULTS);

  useEffect(() => {
    if (data) setFaq(pickFaqPage(data));
  }, [data]);

  function updateFaq<K extends keyof FaqPageForm>(key: K, value: FaqPageForm[K]) {
    setFaq((prev) => ({ ...prev, [key]: value }));
  }

  function saveFaqPage() {
    const faqs = faq.faqs
      .map((item) => ({ q: item.q.trim(), a: item.a.trim() }))
      .filter((item) => item.q || item.a);

    saveMutation.mutate(
      { ...faq, faqs: faqs.length > 0 ? faqs : FAQ_PAGE_FORM_DEFAULTS.faqs },
      {
        onSuccess: () => toast.success("FAQ page saved — changes will appear on the public site shortly"),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : "Could not save FAQ page"),
      },
    );
  }

  function resetFaqPage() {
    setFaq(FAQ_PAGE_FORM_DEFAULTS);
    toast.info("Reset to defaults — click Save to apply on the server");
  }

  if (isLoading && !data) {
    return <SettingsPageSkeleton />;
  }

  if (isError && !data) {
    return (
      <p className="text-sm text-destructive py-8">
        Could not load website content. Check that you are signed in and the API is running.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <WebsitePageNav />

      <Card className="border-border/60 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CircleHelp className="h-4 w-4" />
            FAQ
          </CardTitle>
        </CardHeader>
      </Card>

      <FaqPageEditor value={faq} onChange={updateFaq} />

      <div className="sticky bottom-4 flex justify-end gap-2">
        <Button variant="outline" onClick={resetFaqPage}>
          Reset
        </Button>
        <Button onClick={saveFaqPage} disabled={saveMutation.isPending} className="rounded-full font-semibold shadow-lg">
          {saveMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}
