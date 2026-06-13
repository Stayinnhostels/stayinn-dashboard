import { r as reactExports, j as jsxRuntimeExports } from "./_libs/react.mjs";
import { d as useNavigate, O as Outlet } from "./_libs/tanstack__react-router.mjs";
import { b as useAuth } from "./_ssr/router-CXpZMrmV.mjs";
import "./_libs/sonner.mjs";
import { L as LoaderCircle } from "./_libs/lucide-react.mjs";
import "./_libs/tanstack__router-core.mjs";
import "./_libs/tanstack__history.mjs";
import "./_libs/cookie-es.mjs";
import "./_libs/seroval.mjs";
import "./_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "./_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "./_libs/isbot.mjs";
import "./_libs/tanstack__query-core.mjs";
import "./_libs/tanstack__react-query.mjs";
import "./_libs/zustand.mjs";
import "./_libs/zod.mjs";
function AuthenticatedLayout() {
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  reactExports.useLayoutEffect(() => {
    if (!user) {
      navigate({
        to: "/login",
        replace: true
      });
    }
  }, [user, navigate]);
  if (!user) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen w-full items-center justify-center bg-background", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "h-8 w-8 animate-spin text-muted-foreground" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {});
}
export {
  AuthenticatedLayout as component
};
