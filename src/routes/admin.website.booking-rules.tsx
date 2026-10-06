import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BedDouble, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookingRulesPageEditor } from "@/components/admin/website/booking-rules-page-editor";
import { WebsitePageNav } from "@/components/admin/website/website-page-nav";
import { SettingsPageSkeleton } from "@/components/admin/admin-page-skeletons";
import { usePropertySettingsQuery } from "@/queries/settings/usePropertySettingsQuery";
import { useUpdatePropertySettingsMutation } from "@/queries/settings/useUpdatePropertySettingsMutation";
import {
  BOOKING_RULES_PAGE_DEFAULTS,
  pickBookingRulesPage,
  type BookingRulesPageForm,
} from "@/lib/website-booking-rules";

export const Route = createFileRoute("/admin/website/booking-rules")({
  component: BookingRulesWebsitePage,
});

function BookingRulesWebsitePage() {
  const { data, isLoading, isError } = usePropertySettingsQuery();
  const saveMutation = useUpdatePropertySettingsMutation();
  const [rules, setRules] = useState<BookingRulesPageForm>(BOOKING_RULES_PAGE_DEFAULTS);

  useEffect(() => {
    if (data) setRules(pickBookingRulesPage(data));
  }, [data]);

  function updateRules<K extends keyof BookingRulesPageForm>(key: K, value: BookingRulesPageForm[K]) {
    setRules((prev) => ({ ...prev, [key]: value }));
  }

  function saveBookingRules() {
    saveMutation.mutate(rules, {
      onSuccess: () =>
        toast.success("Booking rules saved — changes will appear on the public site shortly"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not save booking rules"),
    });
  }

  function resetBookingRules() {
    setRules(BOOKING_RULES_PAGE_DEFAULTS);
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
            <BedDouble className="h-4 w-4" />
            Booking rules
          </CardTitle>
        </CardHeader>
      </Card>

      <BookingRulesPageEditor value={rules} onChange={updateRules} />

      <div className="sticky bottom-4 flex justify-end gap-2">
        <Button variant="outline" onClick={resetBookingRules}>
          Reset
        </Button>
        <Button
          onClick={saveBookingRules}
          disabled={saveMutation.isPending}
          className="rounded-full font-semibold shadow-lg"
        >
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
