import { createFileRoute, Outlet, useMatch } from "@tanstack/react-router";
import { HomepageContent } from "@/components/admin/website/website-content";

/** Figma 21.18 / 21.19 · Website content → Homepage (hero + call-to-action banner). */
export const Route = createFileRoute("/admin/website")({ component: WebsitePage });

function WebsitePage() {
  const aboutMatch = useMatch({ from: "/admin/website/about", shouldThrow: false });
  const faqMatch = useMatch({ from: "/admin/website/faq", shouldThrow: false });
  const bookingRulesMatch = useMatch({ from: "/admin/website/booking-rules", shouldThrow: false });
  if (aboutMatch || faqMatch || bookingRulesMatch) return <Outlet />;
  return <HomepageContent />;
}
