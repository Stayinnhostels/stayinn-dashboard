import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AboutPageEditor } from "@/components/admin/website/about-page-editor";
import { WebsitePageNav } from "@/components/admin/website/website-page-nav";
import { SettingsPageSkeleton } from "@/components/admin/admin-page-skeletons";
import { usePropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useUpdatePropertySettingsMutation } from "@/queries/settings/useUpdatePropertySettingsMutation";
import { ABOUT_PAGE_FORM_DEFAULTS, pickAboutPage, type AboutPageForm } from "@/lib/website-about";

export const Route = createFileRoute("/admin/website/about")({ component: AboutWebsitePage });

function AboutWebsitePage() {
  const { data, isLoading, isError } = usePropertySettingsQuery();
  const saveMutation = useUpdatePropertySettingsMutation();
  const [about, setAbout] = useState<AboutPageForm>(ABOUT_PAGE_FORM_DEFAULTS);

  useEffect(() => {
    if (data) setAbout(pickAboutPage(data));
  }, [data]);

  function updateAbout<K extends keyof AboutPageForm>(key: K, value: AboutPageForm[K]) {
    setAbout((prev) => ({ ...prev, [key]: value }));
  }

  function saveAboutPage() {
    saveMutation.mutate(about, {
      onSuccess: () => toast.success("About page saved — changes will appear on the public site shortly"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not save about page"),
    });
  }

  function resetAboutPage() {
    setAbout(ABOUT_PAGE_FORM_DEFAULTS);
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
            <FileText className="h-4 w-4" />
            About
          </CardTitle>
        </CardHeader>
      </Card>

      <AboutPageEditor value={about} onChange={updateAbout} />

      <div className="sticky bottom-4 flex justify-end gap-2">
        <Button variant="outline" onClick={resetAboutPage}>
          Reset
        </Button>
        <Button onClick={saveAboutPage} disabled={saveMutation.isPending} className="rounded-full font-semibold shadow-lg">
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
