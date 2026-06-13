import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, a as CardHeader, b as CardTitle, d as CardDescription, c as CardContent } from "./card-DCDRzI6q.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { T as Textarea } from "./textarea-DSyJ1nlY.mjs";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-B91GfZkm.mjs";
import { S as Switch } from "./switch-CQ4rbtn8.mjs";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-fMRf3trd.mjs";
import { a as SettingsPageSkeleton } from "./admin-page-skeletons-NTMVG02X.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { u as usePropertySettingsQuery, s as settingsKeys } from "./usePropertySettingsQuery-CjrVAvRT.mjs";
import { u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { D as DEFAULT_DASHBOARD_ACCENT_COLOR, e as DEFAULT_DASHBOARD_PRIMARY_COLOR, f as DEFAULT_ACCENT_COLOR, h as DEFAULT_PRIMARY_COLOR, u as useAuthStore, s as syncDashboardThemeFromSettings } from "./router-CXpZMrmV.mjs";
import { r as Building2, s as Palette, e as LayoutDashboard, t as Share2, B as BedDouble, I as Image, X, L as LoaderCircle } from "../_libs/lucide-react.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/clsx.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/radix-ui__react-select.mjs";
import "../_libs/radix-ui__number.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/radix-ui__react-collection.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__react-direction.mjs";
import "../_libs/@radix-ui/react-dismissable-layer+[...].mjs";
import "../_libs/@radix-ui/react-use-callback-ref+[...].mjs";
import "../_libs/@radix-ui/react-use-escape-keydown+[...].mjs";
import "../_libs/radix-ui__react-focus-guards.mjs";
import "../_libs/radix-ui__react-focus-scope.mjs";
import "../_libs/radix-ui__react-id.mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-popper.mjs";
import "../_libs/floating-ui__react-dom.mjs";
import "../_libs/floating-ui__dom.mjs";
import "../_libs/floating-ui__core.mjs";
import "../_libs/floating-ui__utils.mjs";
import "../_libs/radix-ui__react-arrow.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-portal.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/@radix-ui/react-visually-hidden+[...].mjs";
import "../_libs/aria-hidden.mjs";
import "../_libs/react-remove-scroll.mjs";
import "tslib";
import "../_libs/react-remove-scroll-bar.mjs";
import "../_libs/react-style-singleton.mjs";
import "../_libs/get-nonce.mjs";
import "../_libs/use-sidecar.mjs";
import "../_libs/use-callback-ref.mjs";
import "../_libs/radix-ui__react-switch.mjs";
import "../_libs/radix-ui__react-tabs.mjs";
import "../_libs/radix-ui__react-roving-focus.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "./skeleton-CoUJiN10.mjs";
import "./table-RrXKMtST.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/zustand.mjs";
import "../_libs/zod.mjs";
async function putPropertySettingsApi(token, input) {
  const data = await apiFetch("/api/v1/settings", {
    method: "PUT",
    token,
    body: JSON.stringify(input)
  });
  if (!data.success || !data.settings) {
    throw new Error(data.message ?? "Could not save settings");
  }
  return data.settings;
}
function useUpdatePropertySettingsMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input) => {
      if (!token) throw new Error("You must be signed in");
      return putPropertySettingsApi(token, input);
    },
    onSuccess: (settings) => {
      queryClient.setQueryData(settingsKeys.property(), settings);
      queryClient.setQueryData(settingsKeys.propertyPublic(), settings);
      syncDashboardThemeFromSettings(
        settings.dashboardPrimaryColor,
        settings.dashboardAccentColor
      );
    }
  });
}
const DEFAULTS = {
  hotelName: "Stay Inn Hostels",
  tagline: "Your home away from home",
  description: "A modern hostel offering comfortable shared and private rooms in the heart of the city.",
  email: "info@stayinnhostels.com",
  phone: "+92 331 0008196",
  address: "Lahore",
  city: "Punjab",
  country: "Pakistan",
  mapUrl: "",
  logoUrl: "",
  coverImageUrl: "",
  primaryColor: DEFAULT_PRIMARY_COLOR,
  accentColor: DEFAULT_ACCENT_COLOR,
  dashboardPrimaryColor: DEFAULT_DASHBOARD_PRIMARY_COLOR,
  dashboardAccentColor: DEFAULT_DASHBOARD_ACCENT_COLOR,
  whatsapp: "923310008196",
  website: "https://stayinnhostels.com",
  instagram: "",
  facebook: "",
  twitter: "",
  youtube: "",
  linkedin: "",
  threads: "",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  minStay: 1,
  maxStay: 30,
  advanceBookingDays: 365,
  cancellationWindowHours: 48,
  cancellationPolicy: "moderate",
  depositPercent: 25,
  allowChildren: true,
  allowPets: false,
  smokingAllowed: false,
  houseRules: "• No loud music after 10pm\n• Keep common areas clean\n• Be respectful of other guests\n• ID required at check-in",
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00"
};
function toFormSettings(data) {
  const {
    whatsapp_url: _u,
    fullAddress: _f,
    ...rest
  } = data;
  return {
    ...rest,
    whatsapp: rest.whatsapp ?? ""
  };
}
function SettingsPage() {
  const {
    data,
    isLoading,
    isError
  } = usePropertySettingsQuery();
  const saveMutation = useUpdatePropertySettingsMutation();
  const [s, setS] = reactExports.useState(DEFAULTS);
  reactExports.useEffect(() => {
    if (data) setS(toFormSettings(data));
  }, [data]);
  function update(key, value) {
    setS((prev) => ({
      ...prev,
      [key]: value
    }));
  }
  function save() {
    saveMutation.mutate(s, {
      onSuccess: () => toast.success("Settings saved — website, dashboard theme, emails, and invoices updated"),
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save settings")
    });
  }
  function reset() {
    setS(DEFAULTS);
    toast.info("Reset to defaults — click Save to apply on the server");
  }
  function uploadLogo(file, key) {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => update(key, r.result);
    r.readAsDataURL(file);
  }
  if (isLoading && !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(SettingsPageSkeleton, {});
  }
  if (isError && !data) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-destructive py-8", children: "Could not load settings. Check that you are signed in and the API is running." });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "property", className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "flex-wrap h-auto", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "property", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Building2, { className: "h-3.5 w-3.5" }),
          " Property"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "branding", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "h-3.5 w-3.5" }),
          " Branding"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "dashboard", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutDashboard, { className: "h-3.5 w-3.5" }),
          " Dashboard"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "social", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "h-3.5 w-3.5" }),
          " Social"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsTrigger, { value: "booking", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(BedDouble, { className: "h-3.5 w-3.5" }),
          " Booking rules"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "property", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Property information" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Saved to the server and used on the public website hero, contact page, footer, booking emails, and invoices." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Hostel name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.hotelName, onChange: (e) => update("hotelName", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tagline" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.tagline, onChange: (e) => update("tagline", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Description" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 3, value: s.description, onChange: (e) => update("description", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Contact email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "email", value: s.email, onChange: (e) => update("email", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Phone" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.phone, onChange: (e) => update("phone", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Street address" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.address, onChange: (e) => update("address", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "City" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.city, onChange: (e) => update("city", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Country" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.country, onChange: (e) => update("country", e.target.value) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Map location link" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "url", value: s.mapUrl, onChange: (e) => update("mapUrl", e.target.value), placeholder: "https://www.google.com/maps/place/… or embed URL from Share → Embed a map" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Paste a Google Maps link or embed URL. The Contact page map updates after you save." })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "branding", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Logo & cover" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Upload your logo and cover image. PNG or JPG recommended." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Logo" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-20 w-20 items-center justify-center rounded-xl border bg-muted", children: s.logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.logoUrl, alt: "Logo", className: "h-full w-full rounded-xl object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-6 w-6 text-muted-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex cursor-pointer items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted", children: [
                    "Upload logo",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => uploadLogo(e.target.files?.[0] ?? null, "logoUrl") })
                  ] }),
                  s.logoUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => update("logoUrl", ""), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }),
                    " Remove"
                  ] })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "mb-2 block", children: "Cover image" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-20 w-32 items-center justify-center rounded-xl border bg-muted", children: s.coverImageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: s.coverImageUrl, alt: "Cover", className: "h-full w-full rounded-xl object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "h-6 w-6 text-muted-foreground" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "inline-flex cursor-pointer items-center justify-center rounded-md border bg-background px-3 py-1.5 text-xs font-semibold hover:bg-muted", children: [
                    "Upload cover",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", accept: "image/*", className: "hidden", onChange: (e) => uploadLogo(e.target.files?.[0] ?? null, "coverImageUrl") })
                  ] }),
                  s.coverImageUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { variant: "ghost", size: "sm", onClick: () => update("coverImageUrl", ""), children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "h-3 w-3" }),
                    " Remove"
                  ] })
                ] })
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Website brand colors" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Updates buttons, links, and gradients on the public website after you save. Dashboard colors are configured separately." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Primary color" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: s.primaryColor, onChange: (e) => update("primaryColor", e.target.value), className: "h-10 w-14 cursor-pointer rounded-md border bg-background" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.primaryColor, onChange: (e) => update("primaryColor", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", size: "sm", className: "h-8 w-fit px-2 text-xs text-muted-foreground", onClick: () => update("primaryColor", DEFAULT_PRIMARY_COLOR), children: [
                "Reset to default (",
                DEFAULT_PRIMARY_COLOR,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Accent color" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: s.accentColor, onChange: (e) => update("accentColor", e.target.value), className: "h-10 w-14 cursor-pointer rounded-md border bg-background" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.accentColor, onChange: (e) => update("accentColor", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", size: "sm", className: "h-8 w-fit px-2 text-xs text-muted-foreground", onClick: () => update("accentColor", DEFAULT_ACCENT_COLOR), children: [
                "Reset to default (",
                DEFAULT_ACCENT_COLOR,
                ")"
              ] })
            ] })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "dashboard", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Dashboard theme" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Primary and accent colors for this admin panel — buttons, sidebar highlights, focus rings, and charts. Save to apply across the dashboard." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Primary color" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: s.dashboardPrimaryColor, onChange: (e) => update("dashboardPrimaryColor", e.target.value), className: "h-10 w-14 cursor-pointer rounded-md border bg-background" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.dashboardPrimaryColor, onChange: (e) => update("dashboardPrimaryColor", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", size: "sm", className: "h-8 w-fit px-2 text-xs text-muted-foreground", onClick: () => update("dashboardPrimaryColor", DEFAULT_DASHBOARD_PRIMARY_COLOR), children: [
                "Reset to default (",
                DEFAULT_DASHBOARD_PRIMARY_COLOR,
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Accent color" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "color", value: s.dashboardAccentColor, onChange: (e) => update("dashboardAccentColor", e.target.value), className: "h-10 w-14 cursor-pointer rounded-md border bg-background" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.dashboardAccentColor, onChange: (e) => update("dashboardAccentColor", e.target.value), className: "font-mono" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { type: "button", variant: "ghost", size: "sm", className: "h-8 w-fit px-2 text-xs text-muted-foreground", onClick: () => update("dashboardAccentColor", DEFAULT_DASHBOARD_ACCENT_COLOR), children: [
                "Reset to default (",
                DEFAULT_DASHBOARD_ACCENT_COLOR,
                ")"
              ] })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Preview" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "How your chosen colors will look on key dashboard elements." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "flex flex-wrap items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md", style: {
              backgroundColor: s.dashboardPrimaryColor
            }, children: "Primary button" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", className: "rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md", style: {
              backgroundColor: s.dashboardAccentColor
            }, children: "Accent / secondary" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white", style: {
              backgroundColor: s.dashboardPrimaryColor
            }, children: "3" })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "social", className: "space-y-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Social & web" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Links shown in your footer and contact pages." })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "WhatsApp number" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.whatsapp ?? "", onChange: (e) => update("whatsapp", e.target.value), placeholder: "+92 331 0008196 or 923310008196" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Shown in the website footer and contact page. Leave blank to use the property phone number." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5 sm:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Website" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.website, onChange: (e) => update("website", e.target.value), placeholder: "https://stayinnhostels.com" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Instagram" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.instagram, onChange: (e) => update("instagram", e.target.value), placeholder: "@username or full URL" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "YouTube" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.youtube, onChange: (e) => update("youtube", e.target.value), placeholder: "@channel or full URL" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "X (Twitter)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.twitter, onChange: (e) => update("twitter", e.target.value), placeholder: "@username or full URL" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Facebook" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.facebook, onChange: (e) => update("facebook", e.target.value), placeholder: "username or full URL" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "LinkedIn" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.linkedin, onChange: (e) => update("linkedin", e.target.value), placeholder: "company/name or full URL" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Threads" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { value: s.threads, onChange: (e) => update("threads", e.target.value), placeholder: "@username or full URL" })
          ] })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsContent, { value: "booking", className: "space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60 border-primary/20 bg-primary/5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Public booking rules page" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardDescription, { children: [
            "Everything in this tab is shown on the website at",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-semibold text-foreground", children: "/booking-rules" }),
            " after you save settings."
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Check-in & check-out" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Default times shown on bookings, emails, and the booking rules page." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Check-in time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: s.checkInTime, onChange: (e) => update("checkInTime", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Check-out time" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: s.checkOutTime, onChange: (e) => update("checkOutTime", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quiet hours start" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: s.quietHoursStart, onChange: (e) => update("quietHoursStart", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Quiet hours end" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "time", value: s.quietHoursEnd, onChange: (e) => update("quietHoursEnd", e.target.value) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Stay rules" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Minimum stay (nights)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: s.minStay, onChange: (e) => update("minStay", Number(e.target.value)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Maximum stay (nights)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: s.maxStay, onChange: (e) => update("maxStay", Number(e.target.value)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Advance booking window (days)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 1, value: s.advanceBookingDays, onChange: (e) => update("advanceBookingDays", Number(e.target.value)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Deposit (%)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, max: 100, value: s.depositPercent, onChange: (e) => update("depositPercent", Number(e.target.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Cancellation policy" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "grid gap-4 sm:grid-cols-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Policy" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(Select, { value: s.cancellationPolicy, onValueChange: (v) => update("cancellationPolicy", v), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "flexible", children: "Flexible — full refund 24h before" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "moderate", children: "Moderate — full refund 5 days before" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "strict", children: "Strict — 50% refund up to 7 days before" })
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Free cancellation window (hours)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { type: "number", min: 0, value: s.cancellationWindowHours, onChange: (e) => update("cancellationWindowHours", Number(e.target.value)) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "Guest preferences" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardContent, { className: "space-y-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Allow children" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Guests under 18 are welcome" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.allowChildren, onCheckedChange: (v) => update("allowChildren", v) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Allow pets" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Pets permitted on the property" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.allowPets, onCheckedChange: (v) => update("allowPets", v) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between rounded-lg border p-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-semibold", children: "Smoking allowed" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Smoking permitted in designated areas" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Switch, { checked: s.smokingAllowed, onCheckedChange: (v) => update("smokingAllowed", v) })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(Card, { className: "border-border/60", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(CardHeader, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardTitle, { className: "text-base", children: "House rules" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(CardDescription, { children: "Shown on booking confirmation and check-in. One per line." })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Textarea, { rows: 6, value: s.houseRules, onChange: (e) => update("houseRules", e.target.value), className: "font-mono text-sm" }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky bottom-4 flex justify-end gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { variant: "outline", onClick: reset, children: "Reset" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { onClick: save, disabled: saveMutation.isPending, className: "rounded-full font-semibold shadow-lg", children: saveMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
        " Saving…"
      ] }) : "Save settings" })
    ] })
  ] });
}
export {
  SettingsPage as component
};
