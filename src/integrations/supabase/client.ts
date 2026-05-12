/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Supabase-free local mock client.
 *
 * Drop-in replacement for the previous Supabase client export. Implements a
 * subset of the Supabase JS API surface that the dashboard touches:
 *   - `supabase.from(table)` query builder (select / insert / update / delete /
 *     filters / order / limit / range / single / maybeSingle / thenable)
 *   - `supabase.auth.*` stubs that succeed without contacting any backend
 *   - `supabase.channel(...)` / `supabase.removeChannel(...)` no-ops
 *   - `supabase.storage.from(...)` upload that returns a local object URL
 *
 * Data lives in-memory only and resets on full page reload. All mutations are
 * applied to the local cache so the UI feels live within a single session.
 *
 * `any` is used liberally here on purpose — this is a dynamic, untyped
 * shim that mirrors the runtime shape of the Supabase client API.
 */

type Row = Record<string, any>;

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`;
}

function daysAgoIso(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ──────────────────────────────────────────────────────────────────────────────
// Seed data
// ──────────────────────────────────────────────────────────────────────────────

const ROOMS: Row[] = [
  {
    id: "room-twin",
    title: "Twin Deluxe Room",
    description: "Spacious shared room ideal for friends or focused professionals.",
    price_per_night: 6499,
    status: "available",
    category: "shared",
    capacity: 2,
    beds_total: 2,
    beds_available: 1,
    amenities: ["WiFi", "AC", "Wardrobe", "Study Table"],
    images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800"],
    created_at: daysAgoIso(120),
  },
  {
    id: "room-triple",
    title: "Triple Classic Room",
    description: "Bright triple sharing — sweet spot of affordability and personal space.",
    price_per_night: 5499,
    status: "full",
    category: "shared",
    capacity: 3,
    beds_total: 3,
    beds_available: 0,
    amenities: ["WiFi", "Laundry", "Study Table"],
    images: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"],
    created_at: daysAgoIso(90),
  },
  {
    id: "room-quad",
    title: "Quad Community Room",
    description: "Most affordable seat-sharing — perfect for community-loving students.",
    price_per_night: 4499,
    status: "available",
    category: "shared",
    capacity: 4,
    beds_total: 4,
    beds_available: 2,
    amenities: ["WiFi", "Lockers", "Power Backup"],
    images: ["https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800"],
    created_at: daysAgoIso(60),
  },
  {
    id: "room-suite",
    title: "Private Suite",
    description: "Your own private retreat with attached bathroom.",
    price_per_night: 11999,
    status: "available",
    category: "private",
    capacity: 1,
    beds_total: 1,
    beds_available: 1,
    amenities: ["WiFi", "AC", "Attached Bathroom", "Wardrobe"],
    images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800"],
    created_at: daysAgoIso(30),
  },
  {
    id: "room-loft",
    title: "Garden Loft",
    description: "Sun-drenched loft overlooking the courtyard garden.",
    price_per_night: 8999,
    status: "maintenance",
    category: "private",
    capacity: 2,
    beds_total: 1,
    beds_available: 0,
    amenities: ["WiFi", "AC", "Balcony"],
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800"],
    created_at: daysAgoIso(20),
  },
];

const PROFILES: Row[] = [
  {
    id: "user-1",
    email: "alex@example.com",
    full_name: "Alex Morgan",
    phone: "+1 555 0111",
    avatar_url: null,
    created_at: daysAgoIso(80),
  },
  {
    id: "user-2",
    email: "priya@example.com",
    full_name: "Priya Sharma",
    phone: "+91 98000 11122",
    avatar_url: null,
    created_at: daysAgoIso(60),
  },
  {
    id: "user-3",
    email: "carlos@example.com",
    full_name: "Carlos Reyes",
    phone: "+34 600 222 333",
    avatar_url: null,
    created_at: daysAgoIso(45),
  },
  {
    id: "user-4",
    email: "mia@example.com",
    full_name: "Mia Tanaka",
    phone: "+81 80 1111 2222",
    avatar_url: null,
    created_at: daysAgoIso(30),
  },
  {
    id: "user-5",
    email: "jordan@example.com",
    full_name: "Jordan Lee",
    phone: null,
    avatar_url: null,
    created_at: daysAgoIso(10),
  },
  {
    id: "admin-1",
    email: "admin@stayinn.local",
    full_name: "Stay Inn Admin",
    phone: null,
    avatar_url: null,
    created_at: daysAgoIso(200),
  },
];

const USER_ROLES: Row[] = [
  { id: uid(), user_id: "admin-1", role: "super_admin", created_at: daysAgoIso(200) },
  { id: uid(), user_id: "user-1", role: "user", created_at: daysAgoIso(80) },
  { id: uid(), user_id: "user-2", role: "user", created_at: daysAgoIso(60) },
  { id: uid(), user_id: "user-3", role: "user", created_at: daysAgoIso(45) },
  { id: uid(), user_id: "user-4", role: "user", created_at: daysAgoIso(30) },
  { id: uid(), user_id: "user-5", role: "user", created_at: daysAgoIso(10) },
];

const BOOKINGS: Row[] = [
  {
    id: uid(),
    user_id: "user-1",
    room_id: "room-twin",
    guest_name: "Alex Morgan",
    guest_email: "alex@example.com",
    check_in: daysFromNow(-3),
    check_out: daysFromNow(2),
    guests: 1,
    status: "checked_in",
    total_amount: 32495,
    source: "website",
    notes: null,
    created_at: daysAgoIso(7),
    updated_at: daysAgoIso(3),
  },
  {
    id: uid(),
    user_id: "user-2",
    room_id: "room-triple",
    guest_name: "Priya Sharma",
    guest_email: "priya@example.com",
    check_in: daysFromNow(1),
    check_out: daysFromNow(6),
    guests: 2,
    status: "confirmed",
    total_amount: 27495,
    source: "website",
    notes: "Late arrival",
    created_at: daysAgoIso(5),
    updated_at: daysAgoIso(2),
  },
  {
    id: uid(),
    user_id: "user-3",
    room_id: "room-quad",
    guest_name: "Carlos Reyes",
    guest_email: "carlos@example.com",
    check_in: daysFromNow(4),
    check_out: daysFromNow(9),
    guests: 1,
    status: "pending",
    total_amount: 22495,
    source: "website",
    notes: null,
    created_at: daysAgoIso(2),
    updated_at: daysAgoIso(2),
  },
  {
    id: uid(),
    user_id: "user-4",
    room_id: "room-suite",
    guest_name: "Mia Tanaka",
    guest_email: "mia@example.com",
    check_in: daysFromNow(-12),
    check_out: daysFromNow(-7),
    guests: 1,
    status: "checked_out",
    total_amount: 59995,
    source: "partner",
    notes: null,
    created_at: daysAgoIso(20),
    updated_at: daysAgoIso(7),
  },
  {
    id: uid(),
    user_id: "user-5",
    room_id: "room-twin",
    guest_name: "Jordan Lee",
    guest_email: "jordan@example.com",
    check_in: daysFromNow(-20),
    check_out: daysFromNow(-18),
    guests: 1,
    status: "cancelled",
    total_amount: 12998,
    source: "phone",
    notes: null,
    created_at: daysAgoIso(25),
    updated_at: daysAgoIso(22),
  },
  {
    id: uid(),
    user_id: "user-1",
    room_id: "room-suite",
    guest_name: "Alex Morgan",
    guest_email: "alex@example.com",
    check_in: daysFromNow(0),
    check_out: daysFromNow(0),
    guests: 1,
    status: "confirmed",
    total_amount: 11999,
    source: "website",
    notes: null,
    created_at: daysAgoIso(1),
    updated_at: daysAgoIso(1),
  },
];

const PAYMENTS: Row[] = BOOKINGS.filter((b) => b.status !== "cancelled").map((b) => ({
  id: uid(),
  booking_id: b.id,
  amount: b.total_amount,
  status: b.status === "pending" ? "pending" : "succeeded",
  method: "card",
  created_at: b.created_at,
}));

const REVIEWS: Row[] = [
  {
    id: uid(),
    user_id: "user-1",
    room_id: "room-twin",
    rating: 5,
    status: "published",
    body: "Great stay!",
    created_at: daysAgoIso(15),
  },
  {
    id: uid(),
    user_id: "user-2",
    room_id: "room-triple",
    rating: 4,
    status: "published",
    body: "Comfortable and clean.",
    created_at: daysAgoIso(10),
  },
  {
    id: uid(),
    user_id: "user-4",
    room_id: "room-suite",
    rating: 5,
    status: "pending",
    body: "Loved the suite.",
    created_at: daysAgoIso(5),
  },
  {
    id: uid(),
    user_id: "user-5",
    room_id: "room-quad",
    rating: 3,
    status: "hidden",
    body: "Decent for the price.",
    created_at: daysAgoIso(2),
  },
];

const NOTIFICATIONS: Row[] = [
  {
    id: uid(),
    user_id: "admin-1",
    title: "New booking received",
    body: "Priya Sharma booked Triple Classic Room",
    type: "booking",
    read: false,
    link: "/admin/bookings",
    created_at: daysAgoIso(0),
  },
  {
    id: uid(),
    user_id: "admin-1",
    title: "Payment received",
    body: "$11,999 from Alex Morgan",
    type: "payment",
    read: false,
    link: "/admin/payments",
    created_at: daysAgoIso(1),
  },
  {
    id: uid(),
    user_id: "admin-1",
    title: "Room marked maintenance",
    body: "Garden Loft is under maintenance",
    type: "system",
    read: true,
    link: "/admin/maintenance",
    created_at: daysAgoIso(3),
  },
];

const TABLES: Record<string, Row[]> = {
  rooms: ROOMS,
  profiles: PROFILES,
  user_roles: USER_ROLES,
  bookings: BOOKINGS,
  payments: PAYMENTS,
  reviews: REVIEWS,
  notifications: NOTIFICATIONS,
};

// ──────────────────────────────────────────────────────────────────────────────
// Relation expansion (handles select strings like `*, rooms(title)`)
// ──────────────────────────────────────────────────────────────────────────────

function parseRelations(selectStr: string): string[] {
  // Find segments like `rooms(...)` or `payments(*)`.
  const out: string[] = [];
  const re = /(\w+)\s*\(/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(selectStr))) {
    const name = match[1];
    if (TABLES[name]) out.push(name);
  }
  return out;
}

function expandRow(table: string, row: Row, relations: string[]): Row {
  if (relations.length === 0) return row;
  const out: Row = { ...row };
  for (const rel of relations) {
    if (rel === table) continue;
    if (table === "bookings" && rel === "rooms") {
      out.rooms = TABLES.rooms.find((r) => r.id === row.room_id) ?? null;
    } else if (table === "bookings" && rel === "payments") {
      out.payments = TABLES.payments.filter((p) => p.booking_id === row.id);
    } else if (table === "rooms" && rel === "bookings") {
      out.bookings = TABLES.bookings.filter((b) => b.room_id === row.id);
    } else if (table === "payments" && rel === "bookings") {
      out.bookings = TABLES.bookings.find((b) => b.id === row.booking_id) ?? null;
    }
  }
  return out;
}

// ──────────────────────────────────────────────────────────────────────────────
// Query builder
// ──────────────────────────────────────────────────────────────────────────────

type Op = "select" | "insert" | "update" | "delete" | "upsert";

interface Filter {
  kind: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "is" | "like" | "ilike";
  col: string;
  val: any;
}

type SingleQueryBuilder<T> = Omit<QueryBuilder<T>, "then" | "catch" | "finally"> & {
  then<TResult1 = { data: any; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2>;
};

class QueryBuilder<T = Row> implements PromiseLike<{ data: any[]; error: any }> {
  private table: string;
  private op: Op = "select";
  private selectStr = "*";
  private filters: Filter[] = [];
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private singleMode: "none" | "single" | "maybeSingle" = "none";
  private payload: Row | Row[] | null = null;

  constructor(table: string) {
    this.table = table;
  }

  // -------- builder methods --------

  select(s = "*") {
    this.selectStr = s;
    if (this.op === "select") this.op = "select";
    return this;
  }
  insert(values: Row | Row[]) {
    this.op = "insert";
    this.payload = values;
    return this;
  }
  update(values: Row) {
    this.op = "update";
    this.payload = values;
    return this;
  }
  upsert(values: Row | Row[]) {
    this.op = "upsert";
    this.payload = values;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ kind: "eq", col, val });
    return this;
  }
  neq(col: string, val: any) {
    this.filters.push({ kind: "neq", col, val });
    return this;
  }
  gt(col: string, val: any) {
    this.filters.push({ kind: "gt", col, val });
    return this;
  }
  gte(col: string, val: any) {
    this.filters.push({ kind: "gte", col, val });
    return this;
  }
  lt(col: string, val: any) {
    this.filters.push({ kind: "lt", col, val });
    return this;
  }
  lte(col: string, val: any) {
    this.filters.push({ kind: "lte", col, val });
    return this;
  }
  in(col: string, vals: any[]) {
    this.filters.push({ kind: "in", col, val: vals });
    return this;
  }
  is(col: string, val: any) {
    this.filters.push({ kind: "is", col, val });
    return this;
  }
  like(col: string, val: any) {
    this.filters.push({ kind: "like", col, val });
    return this;
  }
  ilike(col: string, val: any) {
    this.filters.push({ kind: "ilike", col, val });
    return this;
  }
  not() {
    return this;
  }
  or() {
    return this;
  }
  filter() {
    return this;
  }
  contains() {
    return this;
  }
  overlaps() {
    return this;
  }
  match(criteria: Row) {
    for (const k of Object.keys(criteria))
      this.filters.push({ kind: "eq", col: k, val: criteria[k] });
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }
  limit(n: number) {
    this.limitN = n;
    return this;
  }
  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }
  single(): SingleQueryBuilder<T> {
    this.singleMode = "single";
    return this as unknown as SingleQueryBuilder<T>;
  }
  maybeSingle(): SingleQueryBuilder<T> {
    this.singleMode = "maybeSingle";
    return this as unknown as SingleQueryBuilder<T>;
  }

  // -------- execution --------

  private applyFilters(rows: Row[]): Row[] {
    return rows.filter((r) =>
      this.filters.every((f) => {
        const v = r[f.col];
        switch (f.kind) {
          case "eq":
            return v === f.val;
          case "neq":
            return v !== f.val;
          case "gt":
            return v > f.val;
          case "gte":
            return v >= f.val;
          case "lt":
            return v < f.val;
          case "lte":
            return v <= f.val;
          case "in":
            return Array.isArray(f.val) && f.val.includes(v);
          case "is":
            return v === f.val;
          case "like":
          case "ilike": {
            const pattern = String(f.val).replace(/%/g, ".*").replace(/_/g, ".");
            const flags = f.kind === "ilike" ? "i" : "";
            return new RegExp(`^${pattern}$`, flags).test(String(v ?? ""));
          }
          default:
            return true;
        }
      }),
    );
  }

  private execute(): { data: any; error: any } {
    const store = TABLES[this.table] ?? (TABLES[this.table] = []);

    if (this.op === "insert" || this.op === "upsert") {
      const inputs = Array.isArray(this.payload) ? this.payload : [this.payload];
      const inserted = (inputs.filter(Boolean) as Row[]).map((row) => ({
        id: row.id ?? uid(),
        created_at: row.created_at ?? new Date().toISOString(),
        ...row,
      }));
      store.push(...inserted);
      return { data: inserted, error: null };
    }

    if (this.op === "update") {
      const matched = this.applyFilters(store);
      for (const row of matched)
        Object.assign(row, this.payload, { updated_at: new Date().toISOString() });
      return { data: matched, error: null };
    }

    if (this.op === "delete") {
      const matched = this.applyFilters(store);
      const keepIds = new Set(store.filter((r) => !matched.includes(r)).map((r) => r.id));
      TABLES[this.table] = store.filter((r) => keepIds.has(r.id));
      return { data: matched, error: null };
    }

    // SELECT
    let rows = this.applyFilters([...store]);
    if (this.orderCol) {
      const col = this.orderCol;
      const asc = this.orderAsc;
      rows.sort((a, b) => {
        const av = a[col];
        const bv = b[col];
        if (av == null && bv == null) return 0;
        if (av == null) return asc ? -1 : 1;
        if (bv == null) return asc ? 1 : -1;
        if (av < bv) return asc ? -1 : 1;
        if (av > bv) return asc ? 1 : -1;
        return 0;
      });
    }
    if (this.rangeFrom != null && this.rangeTo != null) {
      rows = rows.slice(this.rangeFrom, this.rangeTo + 1);
    } else if (this.limitN != null) {
      rows = rows.slice(0, this.limitN);
    }

    const relations = parseRelations(this.selectStr);
    rows = rows.map((r) => expandRow(this.table, r, relations));

    if (this.singleMode === "single") {
      return rows.length === 0
        ? { data: null, error: { message: "No rows found", code: "PGRST116" } }
        : { data: rows[0], error: null };
    }
    if (this.singleMode === "maybeSingle") {
      return { data: rows[0] ?? null, error: null };
    }
    return { data: rows, error: null };
  }

  then<TResult1 = { data: any[]; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: any[]; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve(this.execute() as { data: any[]; error: any }).then(
      onfulfilled,
      onrejected,
    );
  }

  // Used by some libraries that want catch/finally on PromiseLike results
  catch(onrejected: any) {
    return Promise.resolve(this.execute()).catch(onrejected);
  }
  finally(onfinally: any) {
    return Promise.resolve(this.execute()).finally(onfinally);
  }

  // Generic — prevents TS errors for unused T parameter
  _t?: T;
}

// ──────────────────────────────────────────────────────────────────────────────
// Auth stub
// ──────────────────────────────────────────────────────────────────────────────

const auth = {
  async signInWithPassword({ email }: { email: string; password: string }) {
    return {
      data: {
        user: {
          id: "admin-1",
          email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: { full_name: "Admin" },
        },
        session: {
          access_token: "local-mock-token",
          user: {
            id: "admin-1",
            email,
            email_confirmed_at: new Date().toISOString(),
            user_metadata: { full_name: "Admin" },
          },
        },
      },
      error: null,
    };
  },
  async signUp({ email, options }: { email: string; password: string; options?: any }) {
    return {
      data: {
        user: {
          id: uid(),
          email,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: options?.data ?? {},
        },
        session: null,
      },
      error: null,
    };
  },
  async signOut() {
    return { error: null };
  },
  async getSession() {
    return { data: { session: null }, error: null };
  },
  async getUser() {
    return { data: { user: null }, error: null };
  },
  async resetPasswordForEmail() {
    return { data: {}, error: null };
  },
  async updateUser() {
    return { data: { user: null }, error: null };
  },
  async verifyOtp() {
    return { data: { user: null, session: null }, error: null };
  },
  async resend() {
    return { data: {}, error: null };
  },
  onAuthStateChange(_cb: any) {
    return { data: { subscription: { unsubscribe() {} } } };
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Channels / storage stubs
// ──────────────────────────────────────────────────────────────────────────────

function makeChannel() {
  const channel: any = {
    on() {
      return channel;
    },
    subscribe() {
      return channel;
    },
    unsubscribe() {},
  };
  return channel;
}

const storage = {
  from(_bucket: string) {
    return {
      async upload(
        path: string,
        file: File | Blob,
        _opts?: { cacheControl?: string; upsert?: boolean; contentType?: string },
      ) {
        const url =
          typeof URL !== "undefined" && "createObjectURL" in URL
            ? URL.createObjectURL(file)
            : `local://${path}`;
        return { data: { path, fullPath: path, publicUrl: url }, error: null };
      },
      getPublicUrl(path: string) {
        return { data: { publicUrl: `local://${path}` } };
      },
      async remove() {
        return { data: [], error: null };
      },
    };
  },
};

// ──────────────────────────────────────────────────────────────────────────────
// Public client
// ──────────────────────────────────────────────────────────────────────────────

export const supabase = {
  from<T = Row>(table: string) {
    return new QueryBuilder<T>(table);
  },
  auth,
  channel(_name: string) {
    return makeChannel();
  },
  removeChannel(_ch: any) {
    /* no-op */
  },
  storage,
  rpc(_fn: string, _args?: Row) {
    return Promise.resolve({ data: null, error: null });
  },
};
