import { j as jsxRuntimeExports } from "../_libs/react.mjs";
import { C as Card, c as CardContent } from "./card-DCDRzI6q.mjs";
import { S as Skeleton } from "./skeleton-CoUJiN10.mjs";
import { c as cn } from "./utils-H80jjgLf.mjs";
function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  loading,
  trend,
  accent = "primary"
}) {
  const accents = {
    primary: "bg-primary/10 text-primary",
    success: "bg-emerald-500/10 text-emerald-500",
    warning: "bg-amber-500/10 text-amber-500",
    info: "bg-sky-500/10 text-sky-500"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Card, { className: "border-border/60 bg-card/60 backdrop-blur transition-shadow hover:shadow-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CardContent, { className: "p-5", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-semibold uppercase tracking-widest text-muted-foreground", children: label }),
      loading ? /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "mt-2 h-8 w-24" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-3xl font-extrabold tracking-tight tabular-nums", children: value }),
      delta && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "p",
        {
          className: cn(
            "mt-1 text-xs font-medium",
            trend === "up" && "text-emerald-500",
            trend === "down" && "text-rose-500",
            !trend && "text-muted-foreground"
          ),
          children: delta
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("rounded-xl p-2.5", accents[accent]), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: "h-5 w-5" }) })
  ] }) }) });
}
export {
  StatCard as S
};
