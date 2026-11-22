import { createFileRoute } from "@tanstack/react-router";
import { FaqContent } from "@/components/admin/website/website-content";

/** Figma 21.21–21.23 · Website content → FAQ page (+ add/edit question sheet, remove dialog). */
export const Route = createFileRoute("/admin/website/faq")({ component: FaqContent });
