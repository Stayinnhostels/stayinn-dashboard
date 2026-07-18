import { createFileRoute, redirect } from "@tanstack/react-router";

/** @deprecated Use `/admin/expenses` — kept so old bookmarks still work. */
export const Route = createFileRoute("/admin/profit-loss")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/expenses" });
  },
});
