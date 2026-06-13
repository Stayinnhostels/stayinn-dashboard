import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { d as useNavigate, L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useForm } from "../_libs/react-hook-form.mjs";
import { a } from "../_libs/hookform__resolvers.mjs";
import { t as toast } from "../_libs/sonner.mjs";
import { B as Button } from "./button-DWfIo_Ug.mjs";
import { I as Input } from "./input-C0QjszdI.mjs";
import { L as Label } from "./label-JU3yqRBo.mjs";
import { C as Checkbox } from "./checkbox-Bd1q64ph.mjs";
import { b as useAuth, u as useAuthStore, a as authKeys, g as getApiBaseUrl } from "./router-CXpZMrmV.mjs";
import { u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { L as LoaderCircle, M as Mail, a as Lock, E as EyeOff, b as Eye } from "../_libs/lucide-react.mjs";
import { o as objectType, b as booleanType, s as stringType } from "../_libs/zod.mjs";
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
import "../_libs/radix-ui__react-slot.mjs";
import "../_libs/radix-ui__react-compose-refs.mjs";
import "../_libs/class-variance-authority.mjs";
import "../_libs/clsx.mjs";
import "./utils-H80jjgLf.mjs";
import "../_libs/tailwind-merge.mjs";
import "../_libs/radix-ui__react-label.mjs";
import "../_libs/radix-ui__react-primitive.mjs";
import "../_libs/radix-ui__react-checkbox.mjs";
import "../_libs/radix-ui__react-context.mjs";
import "../_libs/radix-ui__primitive.mjs";
import "../_libs/@radix-ui/react-use-controllable-state+[...].mjs";
import "../_libs/@radix-ui/react-use-layout-effect+[...].mjs";
import "../_libs/radix-ui__react-use-previous.mjs";
import "../_libs/radix-ui__react-use-size.mjs";
import "../_libs/radix-ui__react-presence.mjs";
import "../_libs/tanstack__query-core.mjs";
import "../_libs/zustand.mjs";
function assertProductionApiConfigured() {
  const base = getApiBaseUrl();
  if (base.includes("localhost") || base.includes("127.0.0.1")) {
    throw new Error(
      "This build still points at localhost. Set VITE_API_BASE_URL in Vercel (Production) and redeploy so login hits your real API."
    );
  }
}
async function postLoginApi(body) {
  assertProductionApiConfigured();
  const res = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email.trim().toLowerCase(),
      password: body.password
    })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = typeof data.message === "string" ? data.message : `Sign in failed (${res.status})`;
    throw new Error(msg);
  }
  if (!data.success || !data.token || !data.user) {
    throw new Error(typeof data.message === "string" ? data.message : "Invalid response from server");
  }
  return {
    success: true,
    message: data.message,
    user: data.user,
    token: data.token
  };
}
function mapLoginUserDtoToAuthUser(u) {
  const idRaw = u._id ?? u.id;
  const id = idRaw != null ? String(idRaw) : "";
  const email = u.email.trim().toLowerCase();
  const name = u.name?.trim();
  return {
    id,
    email,
    fullName: name && name.length > 0 ? name : email.split("@")[0] ?? email,
    role: u.role,
    emailVerified: !!u.emailVerified
  };
}
function assertSuperAdminConsoleUser(user) {
  if (user.role !== "super_admin") {
    throw new Error("Only a super administrator can sign in to this console.");
  }
}
function useLoginMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: async ({ email, password }) => postLoginApi({ email, password }),
    onSuccess: (data, variables) => {
      const user = mapLoginUserDtoToAuthUser(data.user);
      assertSuperAdminConsoleUser(user);
      useAuthStore.getState().persistSession({
        user,
        token: data.token,
        remember: variables.remember ?? true
      });
      queryClient.setQueryData(authKeys.session(), { user, token: data.token });
    }
  });
}
const schema = objectType({
  email: stringType().trim().email("Enter a valid email").max(120),
  password: stringType().min(1, "Password is required").max(200),
  remember: booleanType().optional()
});
function postLoginPath() {
  return "/admin";
}
function LoginPage() {
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const loginMutation = useLoginMutation();
  const [showPw, setShowPw] = reactExports.useState(false);
  reactExports.useLayoutEffect(() => {
    if (user) {
      navigate({
        to: postLoginPath(),
        replace: true
      });
    }
  }, [user, navigate]);
  const {
    register,
    handleSubmit,
    formState: {
      errors
    }
  } = useForm({
    resolver: a(schema),
    defaultValues: {
      email: "",
      password: "",
      remember: true
    }
  });
  const onSubmit = async (values) => {
    try {
      await loginMutation.mutateAsync({
        email: values.email,
        password: values.password,
        remember: values.remember
      });
      toast.success("Welcome back!");
      navigate({
        to: postLoginPath()
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sign in failed");
    }
  };
  if (user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen grid lg:grid-cols-2 bg-background", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("aside", { className: "relative hidden lg:flex flex-col justify-between overflow-hidden p-12 text-primary-foreground bg-[image:var(--gradient-hero)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-32 -right-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 -left-32 h-96 w-96 rounded-full bg-[var(--accent)]/30 blur-3xl" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "relative z-10 flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur font-black", children: "S" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xl font-extrabold tracking-tight", children: [
          "Stay Inn",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "opacity-80", children: "." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-4xl font-extrabold leading-tight tracking-tight", children: "Admin & operations console" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-base text-primary-foreground/90 max-w-md", children: "Sign in to manage rooms, bookings, payments, and property settings." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "relative z-10 text-xs text-primary-foreground/70", children: [
        "© ",
        (/* @__PURE__ */ new Date()).getFullYear(),
        " Stay Inn Hostels"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "flex flex-col justify-center px-6 py-10 sm:px-12 lg:px-16", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "lg:hidden mb-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: "/login", className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-hero)] text-primary-foreground font-black", children: "S" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-extrabold tracking-tight", children: [
          "Stay Inn",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-primary", children: "." })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mx-auto w-full max-w-md space-y-8", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-extrabold tracking-tight", children: "Welcome back" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-muted-foreground", children: [
            "Sign in with your super administrator account. The API base URL is set with",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1 text-xs", children: "VITE_API_BASE_URL" }),
            " (defaults to",
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-muted px-1 text-xs", children: "http://localhost:3000" }),
            ")."
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "space-y-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "email", className: "font-semibold", children: "Email" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mail, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "email", type: "email", autoComplete: "email", placeholder: "you@email.com", className: "pl-10 h-11 rounded-full", "aria-invalid": !!errors.email, ...register("email") })
            ] }),
            errors.email && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive font-medium", children: errors.email.message })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "password", className: "font-semibold", children: "Password" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(Input, { id: "password", type: showPw ? "text" : "password", autoComplete: "current-password", placeholder: "••••••••", className: "pl-10 pr-10 h-11 rounded-full", "aria-invalid": !!errors.password, ...register("password") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setShowPw((v) => !v), className: "absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground", "aria-label": showPw ? "Hide password" : "Show password", children: showPw ? /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "h-4 w-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "h-4 w-4" }) })
            ] }),
            errors.password && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-destructive font-medium", children: errors.password.message })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm cursor-pointer select-none", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Checkbox, { ...register("remember"), defaultChecked: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: "Remember me for 30 days" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { type: "submit", disabled: loginMutation.isPending, size: "lg", className: "w-full rounded-full font-bold shadow-[var(--shadow-soft)]", children: loginMutation.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-4 w-4 animate-spin" }),
            " Signing in…"
          ] }) : "Sign in" })
        ] })
      ] })
    ] })
  ] });
}
export {
  LoginPage as component
};
