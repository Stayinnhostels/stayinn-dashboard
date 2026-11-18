import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bed,
  Building2,
  CalendarCheck,
  CalendarDays,
  CircleCheck,
  CircleHelp,
  Bell,
  DoorOpen,
  Ellipsis,
  FileText,
  House,
  LayoutDashboard,
  Moon,
  PanelLeft,
  Pencil,
  Plus,
  Search,
  Settings,
  Sun,
  TrendingUp,
  Trash2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AccountChip,
  AmenityChip,
  GlassButton,
  GlassField,
  GlassIconButton,
  GlassInput,
  GlassPanel,
  GlassSearch,
  GlassSelect,
  GlassSidebar,
  GlassToast,
  GlassTopBar,
  GlassAvatar,
  InfoPill,
  KpiCard,
  Logo,
  LogoMark,
  MobileTabBar,
  NavGroupLabel,
  NavItem,
  NotificationItem,
  PlanCard,
  PropertySwitcher,
  RoomCard,
  SidebarUser,
  StatusChip,
  SubNav,
  SubNavItem,
  TabItem,
  VDivider,
} from "@/components/glass";

export const Route = createFileRoute("/admin/design-system")({
  component: DesignSystemPage,
});

const COLOR_GROUPS: { title: string; tokens: { name: string; varName: string; tw: string }[] }[] = [
  {
    title: "Text",
    tokens: [
      { name: "text/primary", varName: "--gl-text-primary", tw: "text-ink" },
      { name: "text/secondary", varName: "--gl-text-secondary", tw: "text-ink-2" },
      { name: "text/tertiary", varName: "--gl-text-tertiary", tw: "text-ink-3" },
      { name: "text/on-primary", varName: "--gl-text-on-primary", tw: "text-on-brand" },
    ],
  },
  {
    title: "Brand",
    tokens: [
      { name: "brand/primary", varName: "--gl-brand-primary", tw: "bg-brand" },
      { name: "brand/primary-text", varName: "--gl-brand-primary-text", tw: "text-brand-text" },
      { name: "brand/primary-tint", varName: "--gl-brand-primary-tint", tw: "bg-brand-tint" },
      {
        name: "brand/primary-border",
        varName: "--gl-brand-primary-border",
        tw: "border-brand-border",
      },
    ],
  },
  {
    title: "Glass",
    tokens: [
      { name: "bg/base", varName: "--gl-bg-base", tw: "bg-base" },
      { name: "glass/1", varName: "--gl-glass-1", tw: "bg-glass-1" },
      { name: "glass/2", varName: "--gl-glass-2", tw: "bg-glass-2" },
      { name: "glass/3", varName: "--gl-glass-3", tw: "bg-glass-3" },
      { name: "glass/stroke", varName: "--gl-glass-stroke", tw: "border-glass-stroke" },
      { name: "glass/inset", varName: "--gl-glass-inset", tw: "bg-glass-inset" },
      { name: "glass/divider", varName: "--gl-glass-divider", tw: "border-glass-divider" },
    ],
  },
  {
    title: "Status",
    tokens: [
      { name: "status/success", varName: "--gl-success", tw: "text-success" },
      { name: "status/success-tint", varName: "--gl-success-tint", tw: "bg-success-tint" },
      { name: "status/warning", varName: "--gl-warning", tw: "text-warning" },
      { name: "status/warning-tint", varName: "--gl-warning-tint", tw: "bg-warning-tint" },
      { name: "status/danger", varName: "--gl-danger", tw: "text-danger" },
      { name: "status/danger-solid", varName: "--gl-danger-solid", tw: "bg-danger-solid" },
      { name: "status/danger-tint", varName: "--gl-danger-tint", tw: "bg-danger-tint" },
      { name: "status/info", varName: "--gl-info", tw: "text-info" },
      { name: "status/info-tint", varName: "--gl-info-tint", tw: "bg-info-tint" },
    ],
  },
];

const TYPE_STYLES = [
  { name: "Display/Page title", cls: "text-page-title", spec: "28 / 34 · SemiBold · −1%" },
  { name: "Display/KPI", cls: "text-kpi", spec: "32 / 36 · SemiBold · −1.5%" },
  { name: "Display/Hero", cls: "text-hero", spec: "24 / 30 · SemiBold · −1%" },
  { name: "Heading/Card title", cls: "text-card-title", spec: "15 / 20 · SemiBold" },
  { name: "Body/SemiBold", cls: "text-body font-semibold", spec: "14 / 20 · SemiBold" },
  { name: "Body/Medium", cls: "text-body font-medium", spec: "14 / 20 · Medium" },
  { name: "Body/Regular", cls: "text-body", spec: "14 / 20 · Regular" },
  { name: "Label/Medium", cls: "text-label font-medium", spec: "12 / 16 · Medium" },
  { name: "Label/Regular", cls: "text-label", spec: "12 / 16 · Regular" },
  { name: "Label/Eyebrow", cls: "text-eyebrow", spec: "11 / 16 · SemiBold · +8% · CAPS" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-eyebrow text-ink-3">{title}</h2>
      {children}
    </section>
  );
}

function DesignSystemPage() {
  const [dark, setDark] = useState(false);
  const [amenities, setAmenities] = useState({ wifi: false, ac: true });
  const [tab, setTab] = useState("Home");

  return (
    <div
      className={cn("glass-root -mx-4 min-h-full rounded-[20px] p-4 md:mx-0 md:p-6", dark && "dark")}
    >
      <div className="mx-auto flex max-w-[1344px] flex-col gap-12">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-page-title text-ink">StayInn · Glass Design System</h1>
            <p className="mt-1 text-body text-ink-2">
              Variables: Glass collection (Dark / Light modes) · Effects: Glass/1–3 · Type: Geist
            </p>
          </div>
          <div className="glass-2 flex rounded-[14px] p-1" role="group" aria-label="Theme mode">
            <GlassButton
              size="sm"
              variant={dark ? "ghost" : "primary"}
              aria-pressed={!dark}
              onClick={() => setDark(false)}
            >
              <Sun /> Light
            </GlassButton>
            <GlassButton
              size="sm"
              variant={dark ? "primary" : "ghost"}
              aria-pressed={dark}
              onClick={() => setDark(true)}
            >
              <Moon /> Dark
            </GlassButton>
          </div>
        </header>

        {/* Colors */}
        <Section title="Colours">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {COLOR_GROUPS.map((group) => (
              <GlassPanel key={group.title} level={2} className="flex flex-col gap-3 p-5">
                <h3 className="text-card-title">{group.title}</h3>
                {group.tokens.map((t) => (
                  <div key={t.name} className="flex items-center gap-3">
                    <span
                      className="size-8 shrink-0 rounded-[10px] border border-glass-stroke"
                      style={{ background: `var(${t.varName})` }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-label font-medium text-ink">{t.name}</p>
                      <p className="truncate text-label text-ink-3">{t.tw}</p>
                    </div>
                  </div>
                ))}
              </GlassPanel>
            ))}
          </div>
        </Section>

        {/* Surfaces */}
        <Section title="Surfaces · Effects">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { cls: "glass-1 rounded-[28px]", name: "Glass/1 Panel", use: "Sidebar, page shell" },
              {
                cls: "glass-2 rounded-[20px]",
                name: "Glass/2 Raised",
                use: "Cards, buttons, inputs",
              },
              {
                cls: "glass-3 rounded-[16px]",
                name: "Glass/3 Overlay",
                use: "Toasts, popovers, dialogs",
              },
            ].map((s) => (
              <div key={s.name} className={cn(s.cls, "flex h-32 flex-col justify-end p-5")}>
                <p className="text-card-title">{s.name}</p>
                <p className="text-label text-ink-2">
                  .{s.cls.split(" ")[0]} · {s.use}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typography · Geist">
          <GlassPanel level={2} className="divide-y divide-glass-divider px-5">
            {TYPE_STYLES.map((t) => (
              <div
                key={t.name}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3"
              >
                <p className={cn(t.cls, "text-ink")}>{t.name}</p>
                <p className="text-label text-ink-3">
                  .{t.cls.split(" ")[0]} · {t.spec}
                </p>
              </div>
            ))}
          </GlassPanel>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <GlassButton>
              <Plus /> Button
            </GlassButton>
            <GlassButton size="sm">
              <Plus /> Button
            </GlassButton>
            <GlassButton variant="glass">
              <Plus /> Button
            </GlassButton>
            <GlassButton variant="glass" size="sm">
              <Plus /> Button
            </GlassButton>
            <GlassButton variant="ghost">
              <Plus /> Button
            </GlassButton>
            <GlassButton variant="ghost" size="sm">
              <Plus /> Button
            </GlassButton>
            <GlassButton variant="danger">
              <Plus /> Button
            </GlassButton>
            <GlassButton variant="danger" size="sm">
              <Plus /> Button
            </GlassButton>
            <GlassButton disabled>Disabled</GlassButton>
            <GlassIconButton aria-label="Edit">
              <Pencil />
            </GlassIconButton>
            <GlassIconButton aria-label="Delete" variant="danger">
              <Trash2 />
            </GlassIconButton>
            <GlassIconButton aria-label="Edit (primary)" variant="primary">
              <Pencil />
            </GlassIconButton>
          </div>
        </Section>

        {/* Navigation */}
        <Section title="Navigation">
          <div className="flex flex-wrap items-start gap-8">
            <div className="flex w-[232px] flex-col gap-3">
              <NavItem icon={<LayoutDashboard />}>Nav item</NavItem>
              <NavItem icon={<LayoutDashboard />} active>
                Nav item
              </NavItem>
              <NavItem icon={<CalendarDays />} badge={12}>
                With badge
              </NavItem>
            </div>
            <div className="flex gap-3">
              <TabItem icon={<House />}>Home</TabItem>
              <TabItem icon={<House />} active>
                Home
              </TabItem>
            </div>
          </div>
        </Section>

        {/* Chips */}
        <Section title="Chips & pills">
          <div className="flex flex-wrap items-center gap-3">
            <StatusChip tone="success">Available</StatusChip>
            <StatusChip tone="brand">Full</StatusChip>
            <StatusChip tone="warning">Maintenance</StatusChip>
            <StatusChip tone="info">Booked</StatusChip>
            <StatusChip tone="danger">Overdue</StatusChip>
            <AmenityChip
              selected={amenities.wifi}
              onSelectedChange={(v) => setAmenities((a) => ({ ...a, wifi: v }))}
            >
              WiFi
            </AmenityChip>
            <AmenityChip
              selected={amenities.ac}
              onSelectedChange={(v) => setAmenities((a) => ({ ...a, ac: v }))}
            >
              AC
            </AmenityChip>
            <InfoPill>$48 / seat / month</InfoPill>
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={<CalendarCheck />}
              label="Current bookings"
              value="42"
              context="Arriving tonight: 2"
            />
            <KpiCard
              icon={<DoorOpen />}
              label="Check-outs today"
              value="1"
              context="Leaves at 11:00"
            />
            <KpiCard icon={<Bed />} label="Free beds" value="3" context="of 46 bookable" />
            <KpiCard
              icon={<TrendingUp />}
              label="Occupancy"
              value="93%"
              context="43 / 46 bookable beds"
            />
          </div>
          <RoomCard
            className="w-full max-w-[344px]"
            imageSrc="/design-system/room-sample.jpg"
            imageAlt="Private double room"
            status="Full"
            title="Room 14 · Private double"
            meta="No. 14 · Floor 3 · Alex Rivera"
            price="$48"
            bedsLabel="0 free / 2"
            occupied={2}
            total={2}
            onView={() => {}}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        </Section>

        {/* Form fields */}
        <Section title="Form fields">
          <div className="grid max-w-[760px] gap-4 sm:grid-cols-3">
            <GlassField label="Room number" required>
              {(p) => <GlassInput {...p} defaultValue="17" />}
            </GlassField>
            <GlassField label="Room number" required>
              {(p) => (
                <GlassSelect {...p} defaultValue="17">
                  <option value="17">17</option>
                  <option value="18">18</option>
                </GlassSelect>
              )}
            </GlassField>
            <GlassField label="Room number" required error="Beds available can’t exceed Beds total">
              {(p) => <GlassInput {...p} defaultValue="17" />}
            </GlassField>
          </div>
        </Section>

        {/* Overlays */}
        <Section title="Overlays">
          <div className="flex flex-wrap items-start gap-6">
            <GlassPanel level={3} className="w-[360px] max-w-full p-2">
              <NotificationItem
                icon={<CalendarDays />}
                title="New booking"
                detail="2 guests · Room 14 · tonight"
                time="2m"
                unread
                onClick={() => {}}
              />
              <NotificationItem
                icon={<Building2 />}
                title="Check-out today"
                detail="Maya Chen leaves bed 8 at 11:00"
                time="18m"
              />
            </GlassPanel>
            <div className="flex flex-col gap-3">
              <GlassToast
                icon={<CalendarDays />}
                title="New booking"
                detail="Alex Rivera · 2 guests · Room 14"
                meta="Now"
                progress={65}
              />
              <GlassToast
                icon={<CircleCheck />}
                tone="success"
                title="Booking confirmed"
                detail="Room 14 · 2 guests · tonight"
                progress={65}
                onDismiss={() => {}}
              />
            </div>
          </div>
        </Section>

        {/* Shell */}
        <Section title="Shell components">
          <div className="flex flex-wrap items-start gap-6">
            <GlassSidebar className="h-[860px]">
              <div className="flex items-center justify-between px-1 pb-2">
                <Logo />
                <GlassIconButton aria-label="Collapse sidebar" size="sm">
                  <PanelLeft />
                </GlassIconButton>
              </div>
              <GlassSearch />
              <NavGroupLabel>Principal</NavGroupLabel>
              <NavItem icon={<LayoutDashboard />} active>
                Dashboard
              </NavItem>
              <SubNav>
                <SubNavItem active>Overview</SubNavItem>
                <SubNavItem>Weekly</SubNavItem>
                <SubNavItem>Monthly</SubNavItem>
                <SubNavItem badge={2}>Reports</SubNavItem>
              </SubNav>
              <NavItem icon={<CalendarDays />} badge={12}>
                Bookings
              </NavItem>
              <NavItem icon={<Users />}>Guests</NavItem>
              <NavItem icon={<Bed />}>Rooms</NavItem>
              <NavGroupLabel>Operations</NavGroupLabel>
              <NavItem icon={<Building2 />}>Properties</NavItem>
              <NavItem icon={<FileText />}>Documents</NavItem>
              <NavItem icon={<Settings />}>Settings</NavItem>
              <div className="flex-1" />
              <PlanCard title="Hostel Pro" caption="16 of 25 rooms used" used={16} total={25} />
              <SidebarUser
                initials="LC"
                name="Lina Costa"
                role="Hostel manager"
                onMenu={() => {}}
              />
            </GlassSidebar>

            <GlassSidebar collapsed className="h-[860px]">
              <LogoMark className="mb-3" />
              <GlassIconButton aria-label="Expand sidebar" size="sm" className="mb-2">
                <PanelLeft />
              </GlassIconButton>
              <NavItem collapsed icon={<Search />}>
                Search
              </NavItem>
              <NavItem collapsed active icon={<LayoutDashboard />} badge={2}>
                Dashboard
              </NavItem>
              <NavItem collapsed icon={<CalendarDays />} badge={12}>
                Bookings
              </NavItem>
              <NavItem collapsed icon={<Users />}>
                Guests
              </NavItem>
              <NavItem collapsed icon={<Bed />}>
                Rooms
              </NavItem>
              <NavItem collapsed icon={<Building2 />}>
                Properties
              </NavItem>
              <NavItem collapsed icon={<FileText />}>
                Documents
              </NavItem>
              <NavItem collapsed icon={<Settings />}>
                Settings
              </NavItem>
              <div className="flex-1" />
              <GlassAvatar initials="LC" />
            </GlassSidebar>

            <div className="flex min-w-0 flex-1 flex-col gap-8">
              <GlassPanel level={1} className="overflow-hidden">
                <GlassTopBar>
                  <PropertySwitcher label="Stay Inn Hostels" />
                  <div className="flex-1" />
                  <GlassIconButton aria-label="Help">
                    <CircleHelp />
                  </GlassIconButton>
                  <GlassIconButton aria-label="Notifications" dot>
                    <Bell />
                  </GlassIconButton>
                  <VDivider />
                  <AccountChip
                    initials="LC"
                    name="Lina Costa"
                    role="Super Admin"
                    email="manager@stayinn.example"
                    className="hidden md:flex"
                  />
                </GlassTopBar>
                <div className="p-6">
                  <h2 className="text-page-title">Dashboard</h2>
                  <p className="text-body text-ink-2">Friday, 6 November · StayInn Hostels</p>
                </div>
              </GlassPanel>

              <div className="flex max-w-[390px] flex-col gap-4">
                <div className="flex items-center justify-between">
                  <Logo />
                  <div className="flex items-center gap-2">
                    <GlassIconButton aria-label="Notifications" dot>
                      <Bell />
                    </GlassIconButton>
                    <GlassButton>
                      <Plus /> New
                    </GlassButton>
                  </div>
                </div>
                <MobileTabBar>
                  {[
                    { label: "Home", icon: <House /> },
                    { label: "Bookings", icon: <CalendarDays /> },
                    { label: "Guests", icon: <Users /> },
                    { label: "Rooms", icon: <Bed /> },
                    { label: "More", icon: <Ellipsis /> },
                  ].map((t) => (
                    <TabItem
                      key={t.label}
                      icon={t.icon}
                      active={tab === t.label}
                      onClick={() => setTab(t.label)}
                    >
                      {t.label}
                    </TabItem>
                  ))}
                </MobileTabBar>
              </div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
