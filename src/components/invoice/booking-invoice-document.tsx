import { forwardRef, type CSSProperties } from "react";
import { parseBookingNotes } from "@/lib/booking-notes";
import { formatMoney, normalizeMoneyCurrency } from "@/lib/payments";
import type { BookingInvoiceData } from "@/lib/invoice/types";

type Props = {
  data: BookingInvoiceData;
  className?: string;
};

/**
 * Print/PDF invoice — strict white background and black text only.
 */
export const BookingInvoiceDocument = forwardRef<HTMLDivElement, Props>(function BookingInvoiceDocument(
  { data, className = "" },
  ref,
) {
  const { property, booking } = data;
  const money = (n: number) => formatMoney(n, normalizeMoneyCurrency(booking.currency));
  const { guestNote, events } = parseBookingNotes(data.notes, booking.currency);
  const addressLine = [property.address, property.city, property.country].filter(Boolean).join(", ");

  return (
    <div
      ref={ref}
      className={className}
      style={{
        backgroundColor: "#ffffff",
        color: "#000000",
        fontFamily: "Georgia, 'Times New Roman', serif",
        fontSize: "11pt",
        lineHeight: 1.45,
        width: "210mm",
        minHeight: "297mm",
        padding: "14mm 16mm",
        boxSizing: "border-box",
      }}
    >
      <header style={{ borderBottom: "2px solid #000000", paddingBottom: "12px", marginBottom: "20px" }}>
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
              <p style={{ margin: "4px 0 0", fontSize: "10pt", color: "#000000" }}>{property.tagline}</p>
            ) : null}
          </div>
          <div style={{ textAlign: "right", fontSize: "10pt", color: "#000000" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: "20pt", letterSpacing: "0.12em" }}>INVOICE</p>
            <p style={{ margin: "8px 0 0" }}>
              <strong>No.</strong> {data.invoiceNumber}
            </p>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "14px",
            fontSize: "9.5pt",
            color: "#000000",
          }}
        >
          <div>
            {addressLine ? <p style={{ margin: "0 0 4px" }}>{addressLine}</p> : null}
            {property.phone ? <p style={{ margin: "0 0 4px" }}>Tel: {property.phone}</p> : null}
            {property.email ? <p style={{ margin: 0 }}>Email: {property.email}</p> : null}
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: "0 0 4px" }}>
              <strong>Issue date:</strong> {data.issueDate}
            </p>
            <p style={{ margin: "0 0 4px" }}>
              <strong>Due date:</strong> {data.dueDate}
            </p>
            <p style={{ margin: 0 }}>
              <strong>Booking ref:</strong> {data.bookingReference}
            </p>
          </div>
        </div>
      </header>

      <section style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "8pt",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#000000",
            }}
          >
            Bill to
          </p>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: "12pt", color: "#000000" }}>{booking.guest_name}</p>
          <p style={{ margin: "0 0 4px", color: "#000000" }}>{booking.guest_email}</p>
          <p style={{ margin: 0, color: "#000000" }}>{booking.guest_phone}</p>
        </div>
        <div style={{ flex: 1 }}>
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "8pt",
              fontWeight: 700,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#000000",
            }}
          >
            Booking details
          </p>
          <table style={{ width: "100%", fontSize: "9.5pt", color: "#000000", borderCollapse: "collapse" }}>
            <tbody>
              <Row label="Room" value={booking.room_title ?? "—"} />
              <Row label="Move-in" value={booking.move_in ?? "—"} />
              <Row label="Check-out" value={booking.check_out ?? "—"} />
              <Row label="Seats" value={String(booking.seats_booked)} />
              <Row label="Duration" value={`${booking.months} month(s)`} />
              <Row label="Status" value={booking.status.replace(/_/g, " ")} />
              <Row label="Source" value={booking.source} />
            </tbody>
          </table>
        </div>
      </section>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginBottom: "20px",
          fontSize: "9.5pt",
          color: "#000000",
        }}
      >
        <thead>
          <tr style={{ borderTop: "2px solid #000000", borderBottom: "1px solid #000000" }}>
            <th style={thStyle}>Description</th>
            <th style={{ ...thStyle, width: "18%", textAlign: "center" }}>Qty</th>
            <th style={{ ...thStyle, width: "18%", textAlign: "right" }}>Rate</th>
            <th style={{ ...thStyle, width: "18%", textAlign: "right" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.lineItems.map((line, i) => (
            <tr key={i} style={{ borderBottom: "1px solid #000000" }}>
              <td style={tdStyle}>
                <strong>{line.description}</strong>
                <br />
                <span style={{ fontSize: "8.5pt" }}>{line.detail}</span>
              </td>
              <td style={{ ...tdStyle, textAlign: "center" }}>{line.quantity}</td>
              <td style={{ ...tdStyle, textAlign: "right" }}>{line.unitPrice}</td>
              <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{money(line.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "24px" }}>
        <table style={{ width: "42%", borderCollapse: "collapse", fontSize: "10pt", color: "#000000" }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 0", borderBottom: "1px solid #000000" }}>Subtotal</td>
              <td style={{ padding: "6px 0", borderBottom: "1px solid #000000", textAlign: "right" }}>
                {money(data.subtotal)}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "10px 0", fontWeight: 700, fontSize: "12pt" }}>Total due</td>
              <td style={{ padding: "10px 0", fontWeight: 700, fontSize: "12pt", textAlign: "right" }}>
                {money(data.total)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p style={{ margin: "0 0 20px", fontSize: "9.5pt", fontStyle: "italic", color: "#000000" }}>
        Amount in words: {data.amountInWords}
      </p>

      <section
        style={{
          borderTop: "1px solid #000000",
          paddingTop: "14px",
          fontSize: "9pt",
          color: "#000000",
        }}
      >
        <p style={{ margin: "0 0 8px", fontWeight: 700 }}>Payment & terms</p>
        <p style={{ margin: "0 0 6px" }}>
          Payment is collected offline as per your booking agreement. This invoice is for your records and seat
          reservation at {property.hotelName}. Please quote booking reference {data.bookingReference} in all
          correspondence.
        </p>
        {guestNote || events.length > 0 ? (
          <div style={{ margin: "8px 0 0" }}>
            <strong>Notes:</strong>
            {guestNote ? <p style={{ margin: "4px 0 0" }}>{guestNote}</p> : null}
            {events.map((ev, i) => (
              <p key={i} style={{ margin: "4px 0 0", fontSize: "8.5pt" }}>
                {ev.kind === "cancelled" ? "Cancelled" : ev.kind === "price_adjusted" ? "Price adjusted" : "Note"}
                {ev.date ? ` (${ev.date})` : ""}: {ev.text}
              </p>
            ))}
          </div>
        ) : null}
        <p style={{ margin: "20px 0 0", fontSize: "8.5pt", color: "#000000" }}>
          Booking ID: {booking.id} · Generated {new Date().toLocaleString("en-US")}
        </p>
      </section>

      <footer
        style={{
          marginTop: "32px",
          paddingTop: "12px",
          borderTop: "2px solid #000000",
          textAlign: "center",
          fontSize: "9pt",
          color: "#000000",
        }}
      >
        Thank you for your business.
      </footer>
    </div>
  );
});

const thStyle: CSSProperties = {
  padding: "8px 6px",
  textAlign: "left",
  fontWeight: 700,
  fontSize: "8pt",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: "#000000",
};

const tdStyle: CSSProperties = {
  padding: "10px 6px",
  verticalAlign: "top",
  color: "#000000",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <tr>
      <td style={{ padding: "2px 8px 2px 0", fontWeight: 600, width: "38%", color: "#000000" }}>{label}</td>
      <td style={{ padding: "2px 0", color: "#000000" }}>{value}</td>
    </tr>
  );
}
