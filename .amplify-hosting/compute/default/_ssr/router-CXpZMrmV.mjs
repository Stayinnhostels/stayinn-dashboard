import { c as createRouter, a as createRootRouteWithContext, u as useRouter, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { J as redirect } from "../_libs/tanstack__router-core.mjs";
import { b as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider, u as useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { c as create } from "../_libs/zustand.mjs";
import { o as objectType, b as booleanType, s as stringType } from "../_libs/zod.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
const __vite_import_meta_env__ = { "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SSR": true, "TSS_DEV_SERVER": "false", "TSS_DEV_SSR_STYLES_BASEPATH": "/", "TSS_DEV_SSR_STYLES_ENABLED": "true", "TSS_INLINE_CSS_ENABLED": "false", "TSS_ROUTER_BASEPATH": "", "TSS_SERVER_FN_BASE": "/_serverFn/", "VITE_API_BASE_URL": "http://16.170.226.208:3000" };
function readIntEnv(key, fallback) {
  const raw = __vite_import_meta_env__[key];
  if (raw === void 0 || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}
const appEnv = {
  apiBaseUrl: ("http://16.170.226.208:3000"?.trim() || "http://localhost:3000").replace(/\/$/, ""),
  /** Default `staleTime` for `useQuery` (ms). */
  queryStaleTimeMs: readIntEnv("VITE_QUERY_STALE_TIME_MS", 6e4),
  /** Default `gcTime` for unused queries (ms). */
  queryGcTimeMs: readIntEnv("VITE_QUERY_GC_TIME_MS", 5 * 6e4),
  /** Default failed request retries for queries. */
  queryRetry: readIntEnv("VITE_QUERY_RETRY", 1),
  /** Default failed request retries for mutations (login should not retry). */
  mutationRetry: readIntEnv("VITE_MUTATION_RETRY", 0)
};
function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: appEnv.queryStaleTimeMs,
        gcTime: appEnv.queryGcTimeMs,
        retry: appEnv.queryRetry
      },
      mutations: {
        retry: appEnv.mutationRetry
      }
    }
  });
}
const appCss = "/assets/styles-o_txuuYW.css";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function getApiBaseUrl() {
  return appEnv.apiBaseUrl;
}
async function postLogoutApi(accessToken) {
  const res = await fetch(`${getApiBaseUrl()}/api/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken.trim()}`
    }
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = typeof data.message === "string" ? data.message : `Logout failed (${res.status})`;
    throw new Error(msg);
  }
}
const SESSION_KEY = "stayinn.dashboard.session";
const LEGACY_USER_KEY = "stayinn.auth.user";
function parseSession(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed?.user || !parsed?.token || typeof parsed.token !== "string") return null;
    if (parsed.token === "mock-token") return null;
    if (parsed.user.role !== "super_admin") return null;
    return parsed;
  } catch {
    return null;
  }
}
function loadSession() {
  if (typeof window === "undefined") return null;
  return parseSession(localStorage.getItem(SESSION_KEY)) ?? parseSession(sessionStorage.getItem(SESSION_KEY));
}
function saveSession(session, remember) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
  if (session) {
    const raw = JSON.stringify(session);
    if (remember) localStorage.setItem(SESSION_KEY, raw);
    else sessionStorage.setItem(SESSION_KEY, raw);
  }
}
const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: true,
  hydrate() {
    const session = loadSession();
    if (session) {
      set({ user: session.user, token: session.token, loading: false });
    } else {
      if (typeof window !== "undefined") {
        localStorage.removeItem(LEGACY_USER_KEY);
      }
      set({ user: null, token: null, loading: false });
    }
  },
  persistSession({ user, token, remember }) {
    const session = { user, token };
    saveSession(session, remember);
    set({ user, token, loading: false });
  },
  logout() {
    saveSession(null, true);
    set({ user: null, token: null, loading: false });
  }
}));
const authKeys = {
  all: ["auth"],
  login: () => [...authKeys.all, "login"],
  session: () => [...authKeys.all, "session"]
};
const DEFAULT_PRIMARY_COLOR = "#f97316";
const DEFAULT_ACCENT_COLOR = "#0ea5e9";
function parseHex$1(hex) {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16)
  ];
}
function normalizeBrandColor(value, fallback) {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) return fallback;
  const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  return parseHex$1(withHash) ? withHash.toLowerCase() : fallback;
}
const DEFAULT_DASHBOARD_PRIMARY_COLOR = DEFAULT_PRIMARY_COLOR;
const DEFAULT_DASHBOARD_ACCENT_COLOR = DEFAULT_ACCENT_COLOR;
function parseHex(hex) {
  const normalized = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16)
  ];
}
function mixHex(hex, target, amount) {
  const rgb = parseHex(hex);
  if (!rgb) return hex;
  const t = 255;
  return `#${rgb.map((c) => Math.round(c + (t - c) * amount).toString(16).padStart(2, "0")).join("")}`;
}
function relativeLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function foregroundForBg(hex) {
  const rgb = parseHex(hex);
  if (!rgb) return "oklch(0.99 0.01 80)";
  return relativeLuminance(...rgb) > 0.55 ? "oklch(0.18 0.04 250)" : "oklch(0.99 0.01 80)";
}
function buildDashboardThemeCssVars(primaryColor, accentColor) {
  const primary = normalizeBrandColor(primaryColor, DEFAULT_DASHBOARD_PRIMARY_COLOR);
  const accent = normalizeBrandColor(accentColor, DEFAULT_DASHBOARD_ACCENT_COLOR);
  const primaryLight = mixHex(primary, "white", 0.18);
  const accentLight = mixHex(accent, "white", 0.15);
  const warmAccent = mixHex(primary, "white", 0.42);
  return {
    "--primary": primary,
    "--primary-foreground": foregroundForBg(primary),
    "--ring": primary,
    "--secondary": accent,
    "--secondary-foreground": foregroundForBg(accent),
    "--accent": warmAccent,
    "--accent-foreground": foregroundForBg(warmAccent),
    "--gradient-hero": `linear-gradient(135deg, ${primary}, ${primaryLight})`,
    "--gradient-accent": `linear-gradient(135deg, ${accent}, ${accentLight})`,
    "--gradient-warm": `linear-gradient(135deg, ${warmAccent}, ${primary})`,
    "--shadow-soft": `0 4px 20px -4px color-mix(in srgb, ${primary} 15%, transparent)`,
    "--shadow-glow": `0 0 60px -10px color-mix(in srgb, ${primary} 40%, transparent)`,
    "--sidebar-primary": primary,
    "--sidebar-primary-foreground": foregroundForBg(primary),
    "--sidebar-ring": primary
  };
}
Object.keys(
  buildDashboardThemeCssVars()
);
const CACHE_KEY = "stayinn.dashboard.theme";
function readCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.primary || !parsed?.accent) return null;
    return parsed;
  } catch {
    return null;
  }
}
function applyDashboardTheme(primary, accent) {
  if (typeof document === "undefined") return;
  const vars = buildDashboardThemeCssVars(primary, accent);
  for (const [key, value] of Object.entries(vars)) {
    document.documentElement.style.setProperty(key, value);
  }
}
function saveDashboardThemeCache(primary, accent) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CACHE_KEY, JSON.stringify({ primary, accent }));
}
function clearDashboardThemeCache() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CACHE_KEY);
}
function hydrateDashboardThemeFromStorage() {
  const cached = readCache();
  if (cached) {
    applyDashboardTheme(cached.primary, cached.accent);
  }
}
function syncDashboardThemeFromSettings(primary, accent) {
  applyDashboardTheme(primary, accent);
  if (primary && accent) {
    saveDashboardThemeCache(primary, accent);
  }
}
function AuthProvider({ children }) {
  reactExports.useEffect(() => {
    useAuthStore.getState().hydrate();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(jsxRuntimeExports.Fragment, { children });
}
function useAuth() {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const loading = useAuthStore((s) => s.loading);
  const storeLogout = useAuthStore((s) => s.logout);
  const logout = reactExports.useCallback(async () => {
    const currentToken = useAuthStore.getState().token;
    try {
      if (currentToken) {
        await postLogoutApi(currentToken);
      }
    } catch {
    }
    storeLogout();
    clearDashboardThemeCache();
    queryClient.removeQueries({ queryKey: authKeys.all });
  }, [queryClient, storeLogout]);
  const isAdmin = user?.role === "super_admin";
  return { user, token, loading, isAdmin, logout };
}
const TAB_LOGO_SRC = "/logos/tablogo.png";
const ADMIN_NAV_LOGO_CLASS = "h-10 w-10 object-contain";
const ADMIN_NAV_LOGO_COMPACT_CLASS = "h-12 w-12 object-contain";
if (typeof window !== "undefined") {
  hydrateDashboardThemeFromStorage();
}
function NotFoundComponent() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-7xl font-bold text-foreground", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mt-4 text-xl font-semibold text-foreground", children: "Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "The page you're looking for doesn't exist or has been moved." }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      Link,
      {
        to: "/login",
        className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
        children: "Sign in"
      }
    ) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  const router2 = useRouter();
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-semibold tracking-tight text-foreground", children: "This page didn't load" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: "Something went wrong on our end. You can try refreshing or head back home." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex flex-wrap justify-center gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            router2.invalidate();
            reset();
          },
          className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
          children: "Try again"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/login",
          className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
          children: "Sign in"
        }
      )
    ] })
  ] }) });
}
const Route$n = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Stay Inn — Admin" },
      { name: "description", content: "Stay Inn property admin and operations dashboard." },
      { name: "author", content: "Stay Inn" },
      { property: "og:title", content: "Stay Inn — Admin" },
      { property: "og:description", content: "Property admin and operations dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@StayInnHostels" }
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss
      },
      {
        rel: "icon",
        href: TAB_LOGO_SRC,
        type: "image/png"
      },
      {
        rel: "apple-touch-icon",
        href: TAB_LOGO_SRC
      }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "en", suppressHydrationWarning: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { suppressHydrationWarning: true, children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$n.useRouteContext();
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-right" })
  ] }) });
}
const $$splitComponentImporter$m = () => import("./login-CBIA2wtm.mjs");
const Route$m = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$m, "component"),
  head: () => ({
    meta: [{
      title: "Sign in — Stay Inn Admin"
    }, {
      name: "description",
      content: "Sign in to the Stay Inn admin and operations console."
    }]
  })
});
objectType({
  email: stringType().trim().email("Enter a valid email").max(120),
  password: stringType().min(1, "Password is required").max(200),
  remember: booleanType().optional()
});
const $$splitComponentImporter$l = () => import("./admin-BJvMRlGc.mjs");
const Route$l = createFileRoute("/admin")({
  component: lazyRouteComponent($$splitComponentImporter$l, "component")
});
const $$splitComponentImporter$k = () => import("../_authenticated-CBhZV5cK.mjs");
const Route$k = createFileRoute("/_authenticated")({
  component: lazyRouteComponent($$splitComponentImporter$k, "component")
});
const $$splitComponentImporter$j = () => import("./index-BTU5dmpx.mjs");
const Route$j = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/login"
    });
  },
  component: lazyRouteComponent($$splitComponentImporter$j, "component")
});
const $$splitComponentImporter$i = () => import("./admin.index-BH5vgW8M.mjs");
const Route$i = createFileRoute("/admin/")({
  component: lazyRouteComponent($$splitComponentImporter$i, "component")
});
const $$splitComponentImporter$h = () => import("./admin.users-CF-RrOog.mjs");
const Route$h = createFileRoute("/admin/users")({
  component: lazyRouteComponent($$splitComponentImporter$h, "component")
});
const $$splitComponentImporter$g = () => import("./admin.staff-CE4LcVUS.mjs");
const Route$g = createFileRoute("/admin/staff")({
  component: lazyRouteComponent($$splitComponentImporter$g, "component")
});
const $$splitComponentImporter$f = () => import("./admin.settings-C_QxqvrO.mjs");
const Route$f = createFileRoute("/admin/settings")({
  component: lazyRouteComponent($$splitComponentImporter$f, "component")
});
const $$splitComponentImporter$e = () => import("./admin.rooms-CAC_tCMI.mjs");
const Route$e = createFileRoute("/admin/rooms")({
  component: lazyRouteComponent($$splitComponentImporter$e, "component")
});
const $$splitComponentImporter$d = () => import("./admin.reviews-DLnnvZ4U.mjs");
const Route$d = createFileRoute("/admin/reviews")({
  component: lazyRouteComponent($$splitComponentImporter$d, "component")
});
const $$splitComponentImporter$c = () => import("./admin.profit-loss-_jEdY7oR.mjs");
const Route$c = createFileRoute("/admin/profit-loss")({
  component: lazyRouteComponent($$splitComponentImporter$c, "component")
});
const $$splitComponentImporter$b = () => import("./admin.payments-BPBzf27t.mjs");
const Route$b = createFileRoute("/admin/payments")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./admin.notifications-CYPDH2Fg.mjs");
const Route$a = createFileRoute("/admin/notifications")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./admin.monthly-rent-BpPv58P_.mjs");
const Route$9 = createFileRoute("/admin/monthly-rent")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("./admin.maintenance-LyJ_FP4H.mjs");
const Route$8 = createFileRoute("/admin/maintenance")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./admin.financials-F_PIDLS2.mjs");
const Route$7 = createFileRoute("/admin/financials")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./admin.facilities-DWLwyA8H.mjs");
const Route$6 = createFileRoute("/admin/facilities")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./admin.coupons-vvFInvuq.mjs");
const Route$5 = createFileRoute("/admin/coupons")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./admin.bookings-DDHgATHU.mjs");
const Route$4 = createFileRoute("/admin/bookings")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./dashboard-DtThMcXz.mjs");
const Route$3 = createFileRoute("/_authenticated/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component"),
  head: () => ({
    meta: [{
      title: "Dashboard — Stay Inn Hostels"
    }, {
      name: "description",
      content: "Manage your bookings and account at Stay Inn."
    }]
  })
});
const $$splitComponentImporter$2 = () => import("./admin.users._id-B4nZN20O.mjs");
const Route$2 = createFileRoute("/admin/users/$id")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./admin.rooms._id-By9vcC_c.mjs");
const Route$1 = createFileRoute("/admin/rooms/$id")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./admin.bookings._id-Dw6SZQ0T.mjs");
const Route = createFileRoute("/admin/bookings/$id")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const LoginRoute = Route$m.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$n
});
const AdminRoute = Route$l.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => Route$n
});
const AuthenticatedRoute = Route$k.update({
  id: "/_authenticated",
  getParentRoute: () => Route$n
});
const IndexRoute = Route$j.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$n
});
const AdminIndexRoute = Route$i.update({
  id: "/",
  path: "/",
  getParentRoute: () => AdminRoute
});
const AdminUsersRoute = Route$h.update({
  id: "/users",
  path: "/users",
  getParentRoute: () => AdminRoute
});
const AdminStaffRoute = Route$g.update({
  id: "/staff",
  path: "/staff",
  getParentRoute: () => AdminRoute
});
const AdminSettingsRoute = Route$f.update({
  id: "/settings",
  path: "/settings",
  getParentRoute: () => AdminRoute
});
const AdminRoomsRoute = Route$e.update({
  id: "/rooms",
  path: "/rooms",
  getParentRoute: () => AdminRoute
});
const AdminReviewsRoute = Route$d.update({
  id: "/reviews",
  path: "/reviews",
  getParentRoute: () => AdminRoute
});
const AdminProfitLossRoute = Route$c.update({
  id: "/profit-loss",
  path: "/profit-loss",
  getParentRoute: () => AdminRoute
});
const AdminPaymentsRoute = Route$b.update({
  id: "/payments",
  path: "/payments",
  getParentRoute: () => AdminRoute
});
const AdminNotificationsRoute = Route$a.update({
  id: "/notifications",
  path: "/notifications",
  getParentRoute: () => AdminRoute
});
const AdminMonthlyRentRoute = Route$9.update({
  id: "/monthly-rent",
  path: "/monthly-rent",
  getParentRoute: () => AdminRoute
});
const AdminMaintenanceRoute = Route$8.update({
  id: "/maintenance",
  path: "/maintenance",
  getParentRoute: () => AdminRoute
});
const AdminFinancialsRoute = Route$7.update({
  id: "/financials",
  path: "/financials",
  getParentRoute: () => AdminRoute
});
const AdminFacilitiesRoute = Route$6.update({
  id: "/facilities",
  path: "/facilities",
  getParentRoute: () => AdminRoute
});
const AdminCouponsRoute = Route$5.update({
  id: "/coupons",
  path: "/coupons",
  getParentRoute: () => AdminRoute
});
const AdminBookingsRoute = Route$4.update({
  id: "/bookings",
  path: "/bookings",
  getParentRoute: () => AdminRoute
});
const AuthenticatedDashboardRoute = Route$3.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => AuthenticatedRoute
});
const AdminUsersIdRoute = Route$2.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => AdminUsersRoute
});
const AdminRoomsIdRoute = Route$1.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => AdminRoomsRoute
});
const AdminBookingsIdRoute = Route.update({
  id: "/$id",
  path: "/$id",
  getParentRoute: () => AdminBookingsRoute
});
const AuthenticatedRouteChildren = {
  AuthenticatedDashboardRoute
};
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren
);
const AdminBookingsRouteChildren = {
  AdminBookingsIdRoute
};
const AdminBookingsRouteWithChildren = AdminBookingsRoute._addFileChildren(
  AdminBookingsRouteChildren
);
const AdminRoomsRouteChildren = {
  AdminRoomsIdRoute
};
const AdminRoomsRouteWithChildren = AdminRoomsRoute._addFileChildren(
  AdminRoomsRouteChildren
);
const AdminUsersRouteChildren = {
  AdminUsersIdRoute
};
const AdminUsersRouteWithChildren = AdminUsersRoute._addFileChildren(
  AdminUsersRouteChildren
);
const AdminRouteChildren = {
  AdminBookingsRoute: AdminBookingsRouteWithChildren,
  AdminCouponsRoute,
  AdminFacilitiesRoute,
  AdminFinancialsRoute,
  AdminMaintenanceRoute,
  AdminMonthlyRentRoute,
  AdminNotificationsRoute,
  AdminPaymentsRoute,
  AdminProfitLossRoute,
  AdminReviewsRoute,
  AdminRoomsRoute: AdminRoomsRouteWithChildren,
  AdminSettingsRoute,
  AdminStaffRoute,
  AdminUsersRoute: AdminUsersRouteWithChildren,
  AdminIndexRoute
};
const AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  AdminRoute: AdminRouteWithChildren,
  LoginRoute
};
const routeTree = Route$n._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = createAppQueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  ADMIN_NAV_LOGO_COMPACT_CLASS as A,
  DEFAULT_DASHBOARD_ACCENT_COLOR as D,
  Route$2 as R,
  TAB_LOGO_SRC as T,
  authKeys as a,
  useAuth as b,
  ADMIN_NAV_LOGO_CLASS as c,
  appEnv as d,
  DEFAULT_DASHBOARD_PRIMARY_COLOR as e,
  DEFAULT_ACCENT_COLOR as f,
  getApiBaseUrl as g,
  DEFAULT_PRIMARY_COLOR as h,
  Route$1 as i,
  Route as j,
  router as r,
  syncDashboardThemeFromSettings as s,
  useAuthStore as u
};
