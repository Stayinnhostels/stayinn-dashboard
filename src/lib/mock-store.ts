/**
 * In-memory mock data store. Replaces Supabase for the admin dashboard.
 * Data resets on page reload — settings persist in localStorage.
 */

// Placeholder URLs (source project used bundled jpgs; those files are not in this repo)
const room2 =
  "https://images.unsplash.com/photo-1595526114035-0fdf38d01f08?w=800&q=80";
const room3 =
  "https://images.unsplash.com/photo-1611892440504-42a792e54d34?w=800&q=80";
const room4 =
  "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80";
const roomPriv =
  "https://images.unsplash.com/photo-1631049307264-da0c9a7b09b0?w=800&q=80";

// ============ Types ============
export type RoomStatus = "available" | "full" | "maintenance" | "draft";
export type BookingStatus = "pending" | "confirmed" | "checked_in" | "checked_out" | "cancelled";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";
export type ReviewStatus = "pending" | "approved" | "rejected";
export type MaintenanceStatus = "open" | "in_progress" | "resolved" | "cancelled";
export type MaintenancePriority = "low" | "medium" | "high" | "urgent";
export type UserRole = "user" | "admin" | "super_admin";

export type Room = {
  id: string;
  title: string;
  description: string;
  price_per_night: number;
  status: RoomStatus;
  category: string;
  capacity: number;
  beds_total: number;
  beds_available: number;
  amenities: string[];
  images: string[];
  created_at: string;
};

export type Booking = {
  id: string;
  user_id: string | null;
  room_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: BookingStatus;
  total_amount: number;
  source: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
};

export type Payment = {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: string;
  created_at: string;
};

export type Review = {
  id: string;
  user_id: string;
  room_id: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  featured: boolean;
  created_at: string;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  type: "booking" | "payment" | "review" | "system";
  read: boolean;
  link: string | null;
  created_at: string;
};

export type Maintenance = {
  id: string;
  room_id: string | null;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignee: string;
  created_at: string;
};

export type Coupon = {
  id: string;
  code: string;
  description: string;
  discount_type: "percent" | "fixed";
  discount_value: number;
  max_uses: number;
  used: number;
  valid_until: string;
  active: boolean;
  created_at: string;
};

const uid = () => Math.random().toString(36).slice(2, 11);
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();
const daysFromNow = (n: number) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);

// ============ Seed data ============
export const rooms: Room[] = [
  {
    id: "r-twin-deluxe", title: "Twin Deluxe Room",
    description: "Spacious twin sharing with attached bath, AC, WiFi and a quiet study setup.",
    price_per_night: 65, status: "available", category: "shared",
    capacity: 2, beds_total: 2, beds_available: 1,
    amenities: ["Attached Bathroom", "AC", "WiFi", "Study Table"],
    images: [room2], created_at: daysAgo(40),
  },
  {
    id: "r-triple-classic", title: "Triple Classic Room",
    description: "Bright triple sharing room — sweet spot of price and personal space.",
    price_per_night: 55, status: "available", category: "shared",
    capacity: 3, beds_total: 3, beds_available: 2,
    amenities: ["Attached Bathroom", "WiFi", "Wardrobe", "Laundry"],
    images: [room3], created_at: daysAgo(35),
  },
  {
    id: "r-quad-community", title: "Quad Community Room",
    description: "Most affordable seat-sharing — perfect for community-loving guests.",
    price_per_night: 45, status: "full", category: "shared",
    capacity: 4, beds_total: 4, beds_available: 0,
    amenities: ["Common Bathroom", "Lockers", "WiFi", "Power Backup"],
    images: [room4], created_at: daysAgo(30),
  },
  {
    id: "r-private-suite", title: "Private Suite",
    description: "Your own private retreat with attached bathroom and premium WiFi.",
    price_per_night: 120, status: "available", category: "private",
    capacity: 1, beds_total: 1, beds_available: 1,
    amenities: ["Attached Bathroom", "AC", "Premium WiFi", "Study Setup"],
    images: [roomPriv], created_at: daysAgo(20),
  },
  {
    id: "r-twin-economy", title: "Twin Economy Room",
    description: "Comfortable twin sharing at a friendly price.",
    price_per_night: 50, status: "maintenance", category: "shared",
    capacity: 2, beds_total: 2, beds_available: 0,
    amenities: ["Common Bathroom", "WiFi", "Wardrobe"],
    images: [room2], created_at: daysAgo(15),
  },
  {
    id: "r-quad-budget", title: "Quad Budget Room",
    description: "Wallet-friendly quad sharing with all the essentials.",
    price_per_night: 40, status: "available", category: "shared",
    capacity: 4, beds_total: 4, beds_available: 3,
    amenities: ["Common Bathroom", "Lockers", "WiFi"],
    images: [room4], created_at: daysAgo(10),
  },
];

export const profiles: Profile[] = [
  { id: "u-admin", email: "admin@demo.com", full_name: "Demo Admin", phone: "+1 555 0100", avatar_url: null, role: "super_admin", created_at: daysAgo(120) },
  { id: "u-aarav", email: "aarav@demo.com", full_name: "Aarav Mehta", phone: "+91 90000 11111", avatar_url: null, role: "user", created_at: daysAgo(60) },
  { id: "u-priya", email: "priya@demo.com", full_name: "Priya Sharma", phone: "+91 90000 22222", avatar_url: null, role: "user", created_at: daysAgo(45) },
  { id: "u-liam", email: "liam@demo.com", full_name: "Liam Johnson", phone: "+1 555 0123", avatar_url: null, role: "user", created_at: daysAgo(30) },
  { id: "u-sofia", email: "sofia@demo.com", full_name: "Sofia Garcia", phone: "+34 600 111 222", avatar_url: null, role: "user", created_at: daysAgo(20) },
  { id: "u-yuki", email: "yuki@demo.com", full_name: "Yuki Tanaka", phone: "+81 90 1234 5678", avatar_url: null, role: "user", created_at: daysAgo(15) },
  { id: "u-noah", email: "noah@demo.com", full_name: "Noah Smith", phone: "+1 555 0177", avatar_url: null, role: "user", created_at: daysAgo(8) },
];

const guests = profiles.filter((p) => p.role === "user");

export const bookings: Booking[] = Array.from({ length: 18 }).map((_, i) => {
  const guest = guests[i % guests.length];
  const room = rooms[i % rooms.length];
  const created = daysAgo(2 + i * 3);
  const checkIn = daysFromNow(-10 + i * 2);
  const checkOut = daysFromNow(-7 + i * 2);
  const statuses: BookingStatus[] = ["confirmed", "pending", "checked_in", "checked_out", "cancelled", "confirmed"];
  return {
    id: `b-${uid()}`,
    user_id: guest.id, room_id: room.id,
    guest_name: guest.full_name, guest_email: guest.email, guest_phone: guest.phone ?? "",
    check_in: checkIn, check_out: checkOut, guests: 1 + (i % 3),
    status: statuses[i % statuses.length],
    total_amount: room.price_per_night * (3 + (i % 5)),
    source: ["website", "booking.com", "airbnb", "walk-in"][i % 4],
    notes: i % 4 === 0 ? "Early check-in requested" : null,
    created_at: created, updated_at: created,
  };
});

export const payments: Payment[] = bookings
  .filter((b) => b.status !== "cancelled")
  .map((b, i) => ({
    id: `p-${uid()}`,
    booking_id: b.id,
    amount: b.total_amount,
    currency: "USD",
    status: i % 7 === 0 ? "pending" : i % 11 === 0 ? "refunded" : "succeeded",
    method: ["card", "paypal", "stripe", "bank"][i % 4],
    created_at: b.created_at,
  }));

export const reviews: Review[] = [
  { id: `rv-${uid()}`, user_id: "u-aarav", room_id: "r-twin-deluxe", rating: 5, comment: "Loved the location and the staff was very helpful!", status: "approved", featured: true, created_at: daysAgo(12) },
  { id: `rv-${uid()}`, user_id: "u-priya", room_id: "r-private-suite", rating: 4, comment: "Great room, slightly noisy at night.", status: "approved", featured: false, created_at: daysAgo(8) },
  { id: `rv-${uid()}`, user_id: "u-liam", room_id: "r-quad-community", rating: 5, comment: "Best hostel experience I've had.", status: "pending", featured: false, created_at: daysAgo(3) },
  { id: `rv-${uid()}`, user_id: "u-sofia", room_id: "r-triple-classic", rating: 3, comment: "OK but the AC was a bit loud.", status: "pending", featured: false, created_at: daysAgo(1) },
  { id: `rv-${uid()}`, user_id: "u-yuki", room_id: "r-twin-deluxe", rating: 5, comment: "Spotless and modern.", status: "approved", featured: false, created_at: daysAgo(20) },
];

export const notifications: Notification[] = [
  { id: `n-${uid()}`, title: "New booking received", body: "Aarav Mehta booked Twin Deluxe Room.", type: "booking", read: false, link: "/admin/bookings", created_at: daysAgo(0.05) },
  { id: `n-${uid()}`, title: "Payment succeeded", body: "$320 received for booking #b1234.", type: "payment", read: false, link: "/admin/payments", created_at: daysAgo(0.2) },
  { id: `n-${uid()}`, title: "New review pending", body: "Sofia Garcia left a 3-star review.", type: "review", read: false, link: "/admin/reviews", created_at: daysAgo(1) },
  { id: `n-${uid()}`, title: "Maintenance ticket opened", body: "AC issue reported in Twin Economy Room.", type: "system", read: true, link: "/admin/maintenance", created_at: daysAgo(2) },
  { id: `n-${uid()}`, title: "Welcome to Stay Inn Admin", body: "Explore your dashboard to get started.", type: "system", read: true, link: null, created_at: daysAgo(7) },
];

export const maintenance: Maintenance[] = [
  { id: `m-${uid()}`, room_id: "r-twin-economy", title: "AC not cooling", description: "Guest reported the AC stopped cooling at night.", priority: "high", status: "in_progress", assignee: "Ravi (Tech)", created_at: daysAgo(2) },
  { id: `m-${uid()}`, room_id: "r-quad-community", title: "Leaky faucet in shared bathroom", description: "Minor leak, requires plumber.", priority: "medium", status: "open", assignee: "Unassigned", created_at: daysAgo(1) },
  { id: `m-${uid()}`, room_id: "r-private-suite", title: "WiFi router replacement", description: "Speed dropped — schedule replacement.", priority: "low", status: "resolved", assignee: "Ravi (Tech)", created_at: daysAgo(10) },
  { id: `m-${uid()}`, room_id: null, title: "Common area lighting", description: "Two bulbs out in the lounge.", priority: "low", status: "open", assignee: "Unassigned", created_at: daysAgo(0.5) },
];

export const coupons: Coupon[] = [
  { id: `c-${uid()}`, code: "WELCOME10", description: "10% off your first booking", discount_type: "percent", discount_value: 10, max_uses: 100, used: 24, valid_until: daysFromNow(60), active: true, created_at: daysAgo(30) },
  { id: `c-${uid()}`, code: "SUMMER25", description: "Summer flash deal", discount_type: "percent", discount_value: 25, max_uses: 50, used: 12, valid_until: daysFromNow(20), active: true, created_at: daysAgo(15) },
  { id: `c-${uid()}`, code: "STUDENT50", description: "Flat $50 off for students", discount_type: "fixed", discount_value: 50, max_uses: 200, used: 87, valid_until: daysFromNow(120), active: true, created_at: daysAgo(45) },
  { id: `c-${uid()}`, code: "EXPIRED5", description: "Old promo (expired)", discount_type: "percent", discount_value: 5, max_uses: 1000, used: 423, valid_until: daysFromNow(-10), active: false, created_at: daysAgo(180) },
];

// ============ Helpers ============
export function newId(prefix: string) {
  return `${prefix}-${uid()}`;
}
export function nowIso() {
  return new Date().toISOString();
}
export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

// Find helpers commonly needed across pages
export const getRoom = (id: string) => rooms.find((r) => r.id === id);
export const getProfile = (id: string) => profiles.find((p) => p.id === id);
export const getBooking = (id: string) => bookings.find((b) => b.id === id);
