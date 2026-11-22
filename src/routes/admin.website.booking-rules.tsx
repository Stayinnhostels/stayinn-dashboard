import { createFileRoute, redirect } from "@tanstack/react-router";

/** Booking rules moved to Settings → Booking rules (Figma 21.08). Old links keep working. */
export const Route = createFileRoute("/admin/website/booking-rules")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/settings", search: { section: "booking" }, replace: true });
  },
});
