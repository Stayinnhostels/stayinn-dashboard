import { createFileRoute } from "@tanstack/react-router";
import { AboutContent } from "@/components/admin/website/website-content";

/** Figma 21.20 · Website content → About page. */
export const Route = createFileRoute("/admin/website/about")({ component: AboutContent });
