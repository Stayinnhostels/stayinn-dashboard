import { createFileRoute, redirect } from "@tanstack/react-router";

/** By room now lives inside Residents (Figma 07.02): /admin/residents?view=by_room. */
export const Route = createFileRoute("/admin/residents-by-room")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/residents", search: { view: "by_room" } });
  },
});
