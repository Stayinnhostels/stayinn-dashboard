import { createFileRoute, Outlet, useMatch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Globe, LayoutTemplate, Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HeroSectionEditor } from "@/components/admin/website/hero-section-editor";
import { CtaBannerSectionEditor } from "@/components/admin/website/cta-banner-section-editor";
import { WebsitePageNav } from "@/components/admin/website/website-page-nav";
import { SettingsPageSkeleton } from "@/components/admin/admin-page-skeletons";
import { usePropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useUpdatePropertySettingsMutation } from "@/queries/settings/useUpdatePropertySettingsMutation";
import {
  CTA_BANNER_SECTION_DEFAULTS,
  HERO_SECTION_DEFAULTS,
  pickCtaBannerSection,
  pickHeroSection,
  type CtaBannerSectionForm,
  type HeroSectionForm,
} from "@/lib/website-homepage";

export const Route = createFileRoute("/admin/website")({ component: WebsitePage });

type WebsiteTab = "hero" | "cta";

function WebsitePage() {
  const aboutMatch = useMatch({ from: "/admin/website/about", shouldThrow: false });
  const faqMatch = useMatch({ from: "/admin/website/faq", shouldThrow: false });
  const bookingRulesMatch = useMatch({ from: "/admin/website/booking-rules", shouldThrow: false });
  if (aboutMatch || faqMatch || bookingRulesMatch) {
    return <Outlet />;
  }

  return <HomepageEditor />;
}

function HomepageEditor() {
  const { data, isLoading, isError } = usePropertySettingsQuery();
  const saveMutation = useUpdatePropertySettingsMutation();
  const [activeTab, setActiveTab] = useState<WebsiteTab>("hero");
  const [hero, setHero] = useState<HeroSectionForm>(HERO_SECTION_DEFAULTS);
  const [cta, setCta] = useState<CtaBannerSectionForm>(CTA_BANNER_SECTION_DEFAULTS);

  useEffect(() => {
    if (data) {
      setHero(pickHeroSection(data));
      setCta(pickCtaBannerSection(data));
    }
  }, [data]);

  function updateHero<K extends keyof HeroSectionForm>(key: K, value: HeroSectionForm[K]) {
    setHero((prev) => ({ ...prev, [key]: value }));
  }

  function updateCta<K extends keyof CtaBannerSectionForm>(key: K, value: CtaBannerSectionForm[K]) {
    setCta((prev) => ({ ...prev, [key]: value }));
  }

  function uploadHeroImage(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateHero("heroImageUrl", reader.result as string);
    reader.readAsDataURL(file);
  }

  function saveActiveSection() {
    const payload = activeTab === "hero" ? hero : cta;
    const label = activeTab === "hero" ? "Hero section" : "CTA banner";

    saveMutation.mutate(payload, {
      onSuccess: () => toast.success(`${label} saved — changes will appear on the public homepage shortly`),
      onError: (err) => toast.error(err instanceof Error ? err.message : `Could not save ${label.toLowerCase()}`),
    });
  }

  function resetActiveSection() {
    if (activeTab === "hero") {
      setHero(HERO_SECTION_DEFAULTS);
      toast.info("Reset hero to defaults — click Save to apply on the server");
      return;
    }
    setCta(CTA_BANNER_SECTION_DEFAULTS);
    toast.info("Reset CTA banner to defaults — click Save to apply on the server");
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

  const saveLabel = activeTab === "hero" ? "Save hero section" : "Save CTA banner";
  const resetLabel = activeTab === "hero" ? "Reset hero" : "Reset CTA banner";

  return (
    <div className="space-y-4">
      <WebsitePageNav />

      <Card className="border-border/60 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Homepage
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as WebsiteTab)} className="space-y-4">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="hero">
            <LayoutTemplate className="h-3.5 w-3.5" />
            Hero
          </TabsTrigger>
          <TabsTrigger value="cta">
            <Megaphone className="h-3.5 w-3.5" />
            CTA banner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="space-y-4">
          <HeroSectionEditor value={hero} onChange={updateHero} onUploadHeroImage={uploadHeroImage} />
        </TabsContent>

        <TabsContent value="cta" className="space-y-4">
          <CtaBannerSectionEditor value={cta} onChange={updateCta} />
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-4 flex justify-end gap-2">
        <Button variant="outline" onClick={resetActiveSection}>
          {resetLabel}
        </Button>
        <Button onClick={saveActiveSection} disabled={saveMutation.isPending} className="rounded-full font-semibold shadow-lg">
          {saveMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            saveLabel
          )}
        </Button>
      </div>
    </div>
  );
}
