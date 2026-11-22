import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

/** Figma 16.02 "Location on map": OpenStreetMap with a draggable pin. Click the map to move it. */
export default function MapPin({ lat, lng, onChange, className }: { lat: number | null; lng: number | null; onChange: (lat: number, lng: number) => void; className?: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const cb = useRef(onChange);
  cb.current = onChange;

  useEffect(() => {
    if (!el.current || map.current) return;
    const start: L.LatLngTuple = lat != null && lng != null ? [lat, lng] : [31.5204, 74.3587];
    const m = L.map(el.current, { zoomControl: false, attributionControl: false, scrollWheelZoom: false }).setView(start, lat != null ? 15 : 11);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(m);
    L.control.zoom({ position: "bottomright" }).addTo(m);
    const icon = L.divIcon({
      className: "",
      html: '<span style="display:flex;width:36px;height:36px;border-radius:999px;background:var(--gl-brand-primary,#2563eb);box-shadow:0 6px 16px rgba(37,99,235,.45);align-items:center;justify-content:center;color:#fff"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></span>',
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });
    const mk = L.marker(start, { draggable: true, icon }).addTo(m);
    mk.on("dragend", () => {
      const p = mk.getLatLng();
      cb.current(Number(p.lat.toFixed(6)), Number(p.lng.toFixed(6)));
    });
    m.on("click", (e: L.LeafletMouseEvent) => {
      mk.setLatLng(e.latlng);
      cb.current(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6)));
    });
    map.current = m;
    marker.current = mk;
    // The container may still be sizing (dialog / grid) — fix tiles once it settles.
    const t = window.setTimeout(() => m.invalidateSize(), 200);
    return () => {
      window.clearTimeout(t);
      m.remove();
      map.current = null;
      marker.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Coordinates typed / loaded from outside → move the pin.
  useEffect(() => {
    if (!map.current || !marker.current || lat == null || lng == null) return;
    const cur = marker.current.getLatLng();
    if (Math.abs(cur.lat - lat) < 1e-6 && Math.abs(cur.lng - lng) < 1e-6) return;
    marker.current.setLatLng([lat, lng]);
    map.current.setView([lat, lng], Math.max(map.current.getZoom(), 14));
  }, [lat, lng]);

  return <div ref={el} className={className} />;
}
