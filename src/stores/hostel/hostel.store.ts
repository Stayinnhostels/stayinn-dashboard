import { create } from "zustand";

const SELECTED_HOSTEL_KEY = "stayinn.dashboard.selectedHostel";

function loadSelectedHostelId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SELECTED_HOSTEL_KEY);
    return raw?.trim() ? raw.trim() : null;
  } catch {
    return null;
  }
}

function saveSelectedHostelId(id: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (id) localStorage.setItem(SELECTED_HOSTEL_KEY, id);
    else localStorage.removeItem(SELECTED_HOSTEL_KEY);
  } catch {
    /* ignore */
  }
}

interface HostelStore {
  selectedHostelId: string | null;
  setSelectedHostelId: (id: string | null) => void;
}

export const useHostelStore = create<HostelStore>((set) => ({
  selectedHostelId: loadSelectedHostelId(),
  setSelectedHostelId: (id) => {
    saveSelectedHostelId(id);
    set({ selectedHostelId: id });
  },
}));
