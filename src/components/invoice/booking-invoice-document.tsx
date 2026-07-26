import { forwardRef, type CSSProperties } from "react";
import { parseBookingNotes } from "@/lib/booking-notes";
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR, normalizeBrandColor } from "@/lib/brand-colors";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import type { BookingInvoiceData } from "@/lib/invoice/types";

type Props = {
  data: BookingInvoiceData;
  className?: string;
};

function mixWithWhite(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/i.test(n)) return "#E8F3FA";
  const r = Number.parseInt(n.slice(0, 2), 16);
  const g = Number.parseInt(n.slice(2, 4), 16);
  const b = Number.parseInt(n.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * amount);
  return `#${[mix(r), mix(g), mix(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/**
 * Print/PDF invoice — branded with site primary / secondary hex colors (html2canvas-safe).
 */
export const BookingInvoiceDocument = forwardRef<HTMLDivElement, Props>(function BookingInvoiceDocument(
  { data, className = "" },
  ref,
) {
  const { property, booking } = data;
  const money = (n: number) => formatMoney(n, normalizeMoneyCurrency(booking.currency));
  const { guestNote, events } = parseBookingNotes(data.notes, booking.currency);
  const addressLine = [property.address, property.city, property.country].filter(Boolean).join(", ");

  const primary = normalizeBrandColor(property.primaryColor, DEFAULT_PRIMARY_COLOR);
  const secondary = normalizeBrandColor(property.accentColor, DEFAULT_ACCENT_COLOR);
  const primarySoft = mixWithWhite(primary, 0.88);
  const secondarySoft = mixWithWhite(secondary, 0.88);
  const text = "#1A2332";
  const muted = "#5A6A7A";
  const border = mixWithWhite(primary, 0.72);

  const sectionLabel: CSSProperties = {
    margin: "0 0 8px",
    fontSize: "8pt",
    fontWeight: 700,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: primary,
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        backgroundColor: "#ffffff",
        color: text,
        fontFamily: "Helvetica, Arial, sans-serif",
        fontSize: "11pt",
        lineHeight: 1.45,
        width: "210mm",
        minHeight: "297mm",
        padding: "0 16mm 14mm",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <div style={{ height: "6px", backgroundColor: primary, margin: "0 -16mm" }} />
      <div style={{ height: "2.5px", backgroundColor: secondary, margin: "0 -16mm 18px" }} />

      <header style={{ marginBottom: "18px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
          <div>
            <img
              src={property.logoUrl || "/logos/navlogo.png"}
              alt={property.hotelName}
              style={{
                display: "block",
                maxWidth: "180px",
                maxHeight: "56px",
                objectFit: "contain",
                marginBottom: property.tagline ? "6px" : 0,
              }}
            />
            {property.tagline ? (
              <p style={{ margin: "4px 0 0", fontSize: "9pt", color: muted }}>{property.tagline}</p>
            ) : null}
          </div>
          <div style={{ textAlign: "right", fontSize: "10pt", minWidth: "42%" }}>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: "20pt",
                letterSpacing: "0.1em",
                color: primary,
              }}
            >
              INVOICE
            </p>
            <p style={{ margin: "6px 0 10px", fontWeight: 700, color: primary, fontSize: "10pt" }}>
              No. {data.invoiceNumber}
            </p>
            <div
              style={{
                backgroundColor: secondarySoft,
                border: `1px solid ${border}`,
                borderRadius: "6px",
                padding: "10px 12px",
                textAlign: "left",
                fontSize: "9pt",
              }}
            >
              <MetaRow label="Issue date" value={data.issueDate} muted={muted} text={text} />
              <MetaRow label="Due date" value={data.dueDate} muted={muted} text={text} />
              <MetaRow label="Booking ref" value={data.bookingReference} muted={muted} text={text} last />
            </div>
          </div>
        </div>
        <div style={{ marginTop: "14px", fontSize: "9pt", color: muted }}>
          {addressLine ? <p style={{ margin: "0 0 3px" }}>{addressLine}</p> : null}
          {property.phone ? <p style={{ margin: "0 0 3px" }}>Tel: {property.phone}</p> : null}
          {property.email ? <p style={{ margin: 0 }}>Email: {property.email}</p> : null}
        </div>
        <div
          style={{
            marginTop: "14px",
            borderTop: `2px solid ${primary}`,
            borderBottom: `1px solid ${secondary}`,
            height: 0,
            paddingBottom: "3px",
          }}
        />
      </header>

      <section style={{ display: "flex", gap: "24px", marginBottom: "22px" }}>
        <div style={{ flex: 1 }}>
          <p style={sectionLabel}>Bill to</p>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "12pt", color: text }}>{booking.guest_name}</p>
          <p style={{ margin: "0 0 4px", color: muted }}>{booking.guest_email}</p>
          <p style={{ margin: 0, color: muted }}>{booking.guest_phone}</p>
        </div>
        <div style={{ flex: 1 }}>
          <p style={sectionLabel}>Booking details</p>
          <table style={{ width: "100%", fontSize: "9.5pt", color: text, borderCollapse: "collapse" }}>
            <tbody>
              <Row label="Room" value={booking.room_title ?? "—"} muted={muted} text={text} />
              <Row label="Move-in" value={booking.move_in ?? "—"} muted={muted} text={text} />
              <Row label="Check-out" value={booking.check_out ?? "—"} muted={muted} text={text} />
              <Row label="Seats" value={String(booking.seats_booked)} muted={muted} text={text} />
              <Row label="Duration" value={`${booking.months} month(s)`} muted={muted} text={text} />
              <Row label="Status" value={booking.status.replace(/_/g, " ")} muted={muted} text={text} />
              <Row label="Source" value={booking.source} muted={muted} text={text} />
            </tbody>
          </table>
        </div>
      </section>

      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
          marginBottom: "18px",
          fontSize: "9.5pt",
          color: text,
          overflow: "hidden",
          borderRadius: "6px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: primary }}>
            <th style={{ ...thStyle, color: "#ffffff" }}>Description</th>
            <th style={{ ...thStyle, width: "18%", textAlign: "center", color: "#ffffff" }}>Qty</th>
            <th style={{ ...thStyle, width: "18%", textAlign: "right", color: "#ffffff" }}>Rate</th>
            <th style={{ ...thStyle, width: "18%", textAlign: "right", color: "#ffffff" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((line, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 ? primarySoft : "#ffffff" }}>
              <td style={{ ...tdStyle, borderBottom: `1px solid ${border}` }}>
                <strong style={{ color: text }}>{line.description}</strong>
                <br />
                <span style={{ fontSize: "8.5pt", color: muted }}>{line.detail}</span>
              </td>
              <td style={{ ...tdStyle, textAlign: "center", borderBottom: `1px solid ${border}` }}>{line.quantity}</td>
              <td style={{ ...tdStyle, textAlign: "right", borderBottom: `1px solid ${border}` }}>{line.unitPrice}</td>
              <td
                style={{
                  ...tdStyle,
                  textAlign: "right",
                  fontWeight: 700,
                  color: primary,
                  borderBottom: `1px solid ${border}`,
                }}
              >
                {money(line.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px" }}>
        <table style={{ width: "42%", borderCollapse: "collapse", fontSize: "10pt", color: text }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 0", color: muted }}>Subtotal</td>
              <td style={{ padding: "6px 0", textAlign: "right" }}>{money(data.subtotal)}</td>
            </tr>
            <tr>
              <td
                colSpan={2}
                style={{
                  padding: 0,
                  paddingTop: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    backgroundColor: primary,
                    color: "#ffffff",
                    borderRadius: "6px",
                    padding: "10px 14px",
                    fontWeight: 700,
                    fontSize: "12pt",
                  }}
                >
                  <span>Total due</span>
                  <span>{money(data.total)}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ margin: "0 0 16px", fontSize: "9.5pt", fontStyle: "italic", color: muted }}>
        Amount in words: {data.amountInWords}
      </p>

      <section
        style={{
          backgroundColor: primarySoft,
          border: `1px solid ${border}`,
          borderRadius: "6px",
          padding: "12px 14px",
          fontSize: "9pt",
          color: muted,
        }}
      >
        <p style={{ margin: "0 0 8px", fontWeight: 700, color: primary }}>Payment & terms</p>
        <p style={{ margin: "0 0 6px" }}>
          Payment is collected offline as per your booking agreement. This invoice is for your records and seat
          reservation at {property.hotelName}. Please quote booking reference {data.bookingReference} in all
          correspondence.
        </p>
        {guestNote || events.length > 0 ? (
          <div style={{ margin: "8px 0 0" }}>
            <strong style={{ color: text }}>Notes:</strong>
            {guestNote ? <p style={{ margin: "4px 0 0" }}>{guestNote}</p> : null}
            {events.map((ev, i) => (
              <p key={i} style={{ margin: "4px 0 0", fontSize: "8.5pt" }}>
                {ev.kind === "cancelled" ? "Cancelled" : ev.kind === "price_adjusted" ? "Price adjusted" : "Note"}
                {ev.date ? ` (${ev.date})` : ""}: {ev.text}
              </p>
            ))}
          </div>
        ) : null}
        <p style={{ margin: "12px 0 0", fontSize: "8pt", color: muted }}>
          Booking ID: {booking.id} · Generated {new Date().toLocaleString("en-US")}
        </p>
      </section>

      <footer
        style={{
          marginTop: "28px",
          paddingTop: "12px",
          borderTop: `2px solid ${primary}`,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: "16px",
          fontSize: "9pt",
          color: primary,
          fontWeight: 700,
        }}
      >
        <p style={{ margin: 0 }}>Thank you for your business.</p>
        <img
          src="/logos/invoice-stamp.png"
          alt="Stay Inn Hostels official stamp"
          style={{
            width: "112px",
            height: "112px",
            objectFit: "contain",
            flexShrink: 0,
          }}
        />
      </footer>
    </div>
  );
});

const thStyle: CSSProperties = {
  padding: "9px 8px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: "8pt",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
};

const tdStyle: CSSProperties = {
  padding: "10px 8px",
  verticalAlign: "top",
};

function MetaRow({
  label,
  value,
  muted,
  text,
  last,
}: {
  label: string;
  value: string;
  muted: string;
  text: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
        marginBottom: last ? 0 : "6px",
      }}
    >
      <span style={{ color: muted }}>{label}</span>
      <span style={{ color: text, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

function Row({
  label,
  value,
  muted,
  text,
}: {
  label: string;
  value: string;
  muted: string;
  text: string;
}) {
  return (
    <tr>
      <td style={{ padding: "2px 8px 2px 0", fontWeight: 600, width: "38%", color: muted }}>{label}</td>
      <td style={{ padding: "2px 0", color: text, fontWeight: 600 }}>{value}</td>
    </tr>
  );
}
