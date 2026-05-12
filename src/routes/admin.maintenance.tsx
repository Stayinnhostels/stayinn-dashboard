import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench } from "lucide-react";

export const Route = createFileRoute("/admin/maintenance")({
  component: MaintenancePage,
});

function MaintenancePage() {
  return (
    <Card className="border-border/60">
      <CardContent className="py-20 text-center">
        <Wrench className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <p className="mt-3 text-lg font-extrabold">Maintenance Requests</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Coming soon. Track room issues, assign staff, and monitor ticket status across your property.
          Enable this module by adding a maintenance_requests table to your backend.
        </p>
        <Button variant="outline" className="mt-5" disabled>Open module</Button>
      </CardContent>
    </Card>
  );
}
