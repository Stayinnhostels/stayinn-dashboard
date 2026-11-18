import { createFileRoute, redirect } from "@tanstack/react-router";

/** Monthly rent now lives inside Residents (Figma 07.12): /admin/residents?view=rent. */
export const Route = createFileRoute("/admin/monthly-rent")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/residents", search: { view: "rent" } });
  },
});
