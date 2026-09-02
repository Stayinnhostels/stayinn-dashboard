import { useEffect } from "react";
import { useHostelsQuery } from "@/queries/hostels";
import { useHostelStore } from "@/stores/hostel/hostel.store";

/** Selected property for dashboard scoping; defaults to the default hostel once loaded. */
export function useHostelScope() {
  const selectedHostelId = useHostelStore((s) => s.selectedHostelId);
  const setSelectedHostelId = useHostelStore((s) => s.setSelectedHostelId);
  const { data, isLoading, isError } = useHostelsQuery();
  const hostels = data?.hostels ?? [];

  useEffect(() => {
    if (isLoading || hostels.length === 0) return;
    if (selectedHostelId && hostels.some((h) => h.id === selectedHostelId)) return;
    const fallback =
      hostels.find((h) => h.is_default && h.status === "active") ??
      hostels.find((h) => h.status === "active") ??
      hostels[0];
    if (fallback) setSelectedHostelId(fallback.id);
  }, [isLoading, hostels, selectedHostelId, setSelectedHostelId]);

  const activeHostel = hostels.find((h) => h.id === selectedHostelId) ?? null;

  return {
    hostelId: selectedHostelId,
    activeHostel,
    hostels,
    isLoading,
    isError,
    setSelectedHostelId,
  };
}
