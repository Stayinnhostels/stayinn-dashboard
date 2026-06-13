import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { C as Card, c as CardContent, a as CardHeader, b as CardTitle } from "./card-DCDRzI6q.mjs";
import { A as Avatar, a as AvatarFallback } from "./avatar-BJDbbUeP.mjs";
import { B as Badge } from "./badge-DyfXZgLs.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { a as UserDetailSkeleton, u as userKeys, m as mapApiUserToAdminUser } from "./user.keys-BlaZVJR0.mjs";
import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { R as Route$2, u as useAuthStore } from "./router-CXpZMrmV.mjs";
import "../_libs/sonner.mjs";
import { A as ArrowLeft, M as Mail } from "../_libs/lucide-react.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-avatar.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/@radix-ui/react-use-is-hydrated+[...].mjs";
import "../_libs/use-sync-external-store.mjs";
import "../_libs/class-variance-authority.mjs";
import "./skeleton-CoUJiN10.mjs";
import "./table-RrXKMtST.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
async function getUserApi(token, id) {
  const data = await apiFetch(`/api/v1/users/${encodeURIComponent(id)}`, { token });
  if (!data.success || !data.user) {
    throw new Error("Invalid user response");
  }
  return mapApiUserToAdminUser(data.user);
}
function useUserQuery(id) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => {
      if (!token) throw new Error("You must be signed in to view this user");
      return getUserApi(token, id);
    },
    enabled: Boolean(token && id),
    staleTime: 0
  });
}
function UserDetailPage() {
  const {
    id
  } = Route$2.useParams();
  const {
    data: profile,
    isLoading,
    isError,
    error
  } = useUserQuery(id);
  if (isLoading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(UserDetailSkeleton, {});
  }
  if (isError || !profile) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "py-16 text-center text-sm text-destructive", children: error instanceof Error ? error.message : "User not found." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { asChild: true, variant: "ghost", size: "sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/admin/users", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowLeft, { className: "h-4 w-4" }),
      " Back to users"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-6 lg:grid-cols-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60 lg:col-span-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-4 p-6 text-center", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Avatar, { className: "mx-auto h-24 w-24", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "text-2xl", children: profile.full_name.slice(0, 2).toUpperCase() }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-extrabold", children: profile.full_name }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-2 flex flex-wrap justify-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "secondary", className: "capitalize", children: profile.role.replace("_", " ") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: profile.email_verified ? "border-emerald-500/40 text-emerald-600" : "", children: profile.email_verified ? "Email verified" : "Email not verified" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-left text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "h-3.5 w-3.5 text-muted-foreground" }),
            " ",
            profile.email
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
            "Joined ",
            profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60 lg:col-span-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Activity" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "text-sm text-muted-foreground", children: "Booking and payment history will appear here when those features are connected to the API." })
      ] })
    ] })
  ] });
}
export {
  UserDetailPage as component
};
