import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TicketPercent } from "lucide-react";

export const Route = createFileRoute("/admin/coupons")({
  component: CouponsPage,
});

function CouponsPage() {
  return (
    <Card className="border-border/60">
      <CardContent className="py-20 text-center">
        <TicketPercent className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="mt-3 text-lg font-extrabold">Coupons & Discounts</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Coming soon. Create promotional codes, set expiry and usage limits, and track redemptions.
        </p>
        <Button variant="outline" className="mt-5" disabled>Create coupon</Button>
      </CardContent>
    </Card>
  );
}
