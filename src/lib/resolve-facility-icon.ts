import {
  Archive,
  Bath,
  Bike,
  BookOpen,
  Coffee,
  Droplet,
  Dumbbell,
  Heart,
  Lock,
  MapPin,
  ShieldCheck,
  Shirt,
  Sofa,
  Sparkles,
  Tv,
  Users,
  UtensilsCrossed,
  WashingMachine,
  Wifi,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { FACILITY_ICON_OPTIONS } from "@/lib/facility-icon-options";

const ICON_MAP: Record<(typeof FACILITY_ICON_OPTIONS)[number], LucideIcon> = {
  Wifi,
  UtensilsCrossed,
  Lock,
  WashingMachine,
  Coffee,
  Sofa,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Tv,
  BookOpen,
  Bike,
  Bath,
  Zap,
  Droplet,
  Shirt,
  Archive,
  MapPin,
  Users,
  Heart,
};

export function resolveFacilityIcon(name: string): LucideIcon {
  return ICON_MAP[name as keyof typeof ICON_MAP] ?? Sparkles;
}
