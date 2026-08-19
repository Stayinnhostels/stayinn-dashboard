import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Loader2,
  LogOut,
  Pencil,
  Receipt,
  Search,
  Users,
} from "lucide-react";
import { MonthlyRentTableSkeleton } from "@/components/admin/admin-page-skeletons";
import {
  CnicImagesEditor,
  CnicImagesStatusIcon,
  CnicImagesViewerModal,
} from "@/components/admin/cnic-images";
import { toast } from "sonner";
import { ResidentDetailSheet } from "@/components/admin/resident-detail-sheet";
import { MonthFilterSelect, useSyncedMonthFilter } from "@/components/admin/month-filter-select";
import {
  downloadMonthRentRegisterExcelApi,
  downloadMonthRentRegisterPdfApi,
  downloadResidentMonthInvoiceApi,
} from "@/api/residents";
import { useResidentsRegisterQuery, useUpdateResidentMutation } from "@/queries/residents";
import { useAuthStore } from "@/stores/auth/auth.store";
import { formatMoney } from "@/lib/payments";
import { cn } from "@/lib/utils";
import type {
  ResidentRegisterRow,
  ResidentRegisterCohort,
  ResidentType,
  ResidentGender,
  RentPaymentStatus,
  SecurityStatus,
  UpdateResidentInput,
} from "@/types/domain/resident.types";
import {
  GENDER_LABELS,
  RESIDENT_TYPE_LABELS,
  RENT_PAYMENT_STATUS_LABELS,
  SECURITY_STATUS_LABELS,
} from "@/types/domain/resident.types";

export const Route = createFileRoute("/admin/monthly-rent")({ component: MonthlyRentPage });

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50] as const;

function statusBadgeClass(status: string) {
  switch (status) {
    case "checked_in":
      return "bg-violet-500/15 text-violet-600 border-violet-500/30";
    case "confirmed":
      return "bg-sky-500/15 text-sky-600 border-sky-500/30";
    case "checked_out":
      return "bg-emerald-500/15 text-emerald-600 border-emerald-500/30";
    case "pending":
      return "bg-amber-500/15 text-amber-600 border-amber-500/30";
    default:
      return "";
  }
}

function securityBadgeClass(status: SecurityStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25";
    case "not_paid":
      return "bg-rose-500/15 text-rose-700 border-rose-500/30 hover:bg-rose-500/25";
    case "returned":
      return "bg-sky-500/15 text-sky-700 border-sky-500/30 hover:bg-sky-500/25";
    case "held":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/25";
    default:
      return "bg-muted text-muted-foreground border-border hover:bg-muted/80";
  }
}

function rentBadgeClass(status: RentPaymentStatus) {
  switch (status) {
    case "paid":
      return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 hover:bg-emerald-500/25";
    case "not_paid":
      return "bg-rose-500/15 text-rose-700 border-rose-500/30 hover:bg-rose-500/25";
    case "partial":
      return "bg-amber-500/15 text-amber-700 border-amber-500/30 hover:bg-amber-500/25";
    case "returned":
      return "bg-sky-500/15 text-sky-700 border-sky-500/30 hover:bg-sky-500/25";
    default:
      return "bg-muted text-muted-foreground border-border hover:bg-muted/80";
  }
}

const SECURITY_STATUS_OPTIONS = Object.keys(SECURITY_STATUS_LABELS) as SecurityStatus[];
const RENT_STATUS_OPTIONS = Object.keys(RENT_PAYMENT_STATUS_LABELS) as RentPaymentStatus[];

function InlineSecurityStatus({ row, month }: { row: ResidentRegisterRow; month: string }) {
  const update = useUpdateResidentMutation();

  if (!row.security_due_this_month) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const setStatus = (next: SecurityStatus) => {
    if (next === row.security_status) return;
    update.mutate(
      { bookingId: row.booking_id, input: { security_status: next, month } },
      {
        onSuccess: () => toast.success(`Security: ${SECURITY_STATUS_LABELS[next]}`),
        onError: () => toast.error("Could not update security status"),
      },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={update.isPending}
          onClick={(e) => e.stopPropagation()}
        >
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer gap-0.5 pr-1 text-xs whitespace-nowrap",
              securityBadgeClass(row.security_status),
            )}
          >
            {update.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                {SECURITY_STATUS_LABELS[row.security_status]}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </>
            )}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        {SECURITY_STATUS_OPTIONS.map((key) => (
          <DropdownMenuItem
            key={key}
            disabled={update.isPending || key === row.security_status}
            onSelect={() => setStatus(key)}
          >
            {SECURITY_STATUS_LABELS[key]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function InlineRentStatus({ row, month }: { row: ResidentRegisterRow; month: string }) {
  const update = useUpdateResidentMutation();

  const setStatus = (next: RentPaymentStatus) => {
    if (next === row.payment_status) return;
    update.mutate(
      { bookingId: row.booking_id, input: { month, payment_status: next } },
      {
        onSuccess: () => toast.success(`Rent (${month}): ${RENT_PAYMENT_STATUS_LABELS[next]}`),
        onError: () => toast.error("Could not update rent status"),
      },
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          disabled={update.isPending}
          onClick={(e) => e.stopPropagation()}
        >
          <Badge
            variant="outline"
            className={cn(
              "cursor-pointer gap-0.5 pr-1 text-xs whitespace-nowrap",
              rentBadgeClass(row.payment_status),
            )}
          >
            {update.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                {RENT_PAYMENT_STATUS_LABELS[row.payment_status]}
                <ChevronDown className="h-3 w-3 opacity-60" />
              </>
            )}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
        {RENT_STATUS_OPTIONS.map((key) => (
          <DropdownMenuItem
            key={key}
            disabled={update.isPending || key === row.payment_status}
            onSelect={() => setStatus(key)}
          >
            {RENT_PAYMENT_STATUS_LABELS[key]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EditResidentDialog({
  row,
  month,
  open,
  onOpenChange,
}: {
  row: ResidentRegisterRow | null;
  month: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const update = useUpdateResidentMutation();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [gender, setGender] = useState<ResidentGender>("");
  const [cnic, setCnic] = useState("");
  const [cnicFront, setCnicFront] = useState("");
  const [cnicBack, setCnicBack] = useState("");
  const [bFormImage, setBFormImage] = useState("");
  const [guardian, setGuardian] = useState("");
  const [address, setAddress] = useState("");
  const [seatLabel, setSeatLabel] = useState("");
  const [residentType, setResidentType] = useState<ResidentType>("");
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>("not_applicable");
  const [securityAmount, setSecurityAmount] = useState("");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<RentPaymentStatus>("not_paid");
  const [applyRentForward, setApplyRentForward] = useState(false);

  useEffect(() => {
    if (!row || !open) return;
    setEmail(row.email?.endsWith("@stayinn.internal") ? "" : (row.email ?? ""));
    setPhone(row.contact_number ?? "");
    setChannel(row.channel ?? "");
    setFatherName(row.father_name);
    setGender(row.gender || "");
    setCnic(row.cnic);
    setCnicFront(row.cnic_image_front ?? "");
    setCnicBack(row.cnic_image_back ?? "");
    setBFormImage(row.b_form_image ?? "");
    setGuardian(row.guardian_contact);
    setAddress(row.permanent_address);
    setSeatLabel(row.seat_label);
    setResidentType(row.resident_type || "");
    setSecurityStatus(row.security_status);
    setSecurityAmount(row.security_amount != null ? String(row.security_amount) : "");
    setMonthlyRent(String(row.monthly_rent));
    setPaymentStatus(row.payment_status);
    setApplyRentForward(false);
  }, [row, open]);

  function handleSave() {
    if (!row) return;
    const input: UpdateResidentInput = {
      guest_email: email.trim(),
      guest_phone: phone.trim(),
      source: channel.trim(),
      guest_father_name: fatherName.trim(),
      guest_gender: gender,
      guest_cnic: cnic.trim(),
      guest_cnic_image_front: cnicFront,
      guest_cnic_image_back: cnicBack,
      guest_b_form_image: bFormImage,
      guest_guardian_contact: guardian.trim(),
      guest_permanent_address: address.trim(),
      seat_label: seatLabel.trim(),
      resident_type: residentType,
      month,
      monthly_rent: Number(monthlyRent),
      payment_status: paymentStatus,
      ...(applyRentForward ? { apply_rent_forward: true } : {}),
      ...(row.security_due_this_month
        ? {
            security_status: securityStatus,
            security_amount: securityAmount.trim() ? Number(securityAmount) : null,
          }
        : {}),
    };

    update.mutate(
      { bookingId: row.booking_id, input },
      {
        onSuccess: () => {
          toast.success("Resident record updated");
          onOpenChange(false);
        },
        onError: (err) => toast.error(err instanceof Error ? err.message : "Update failed"),
      },
    );
  }

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit resident — {row.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <p className="text-xs text-muted-foreground">
            Booking {row.booking_ref} · Rent for {month}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Channel </Label>
              <Input
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="Walk-in, Website, or company name"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 300 1234567"
              />
            </div>
            <div className="space-y-2">
              <Label>CNIC number</Label>
              <Input
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="35201-1234567-1"
              />
            </div>
            <div className="space-y-2">
              <Label>Guardian contact number</Label>
              <Input
                value={guardian}
                onChange={(e) => setGuardian(e.target.value)}
                placeholder="+92 300 1234567"
              />
            </div>
            <CnicImagesEditor
              front={cnicFront}
              back={cnicBack}
              onFrontChange={setCnicFront}
              onBackChange={setCnicBack}
              bForm={bFormImage}
              onBFormChange={setBFormImage}
            />
            <div className="space-y-2 sm:col-span-2">
              <Label>Permanent address</Label>
              <Textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / street, city"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Father name</Label>
              <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select
                value={gender || "unset"}
                onValueChange={(v) => setGender(v === "unset" ? "" : (v as ResidentGender))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">—</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Seat label</Label>
              <Input
                value={seatLabel}
                onChange={(e) => setSeatLabel(e.target.value)}
                placeholder="Seat 3"
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={residentType || "unset"}
                onValueChange={(v) => setResidentType(v === "unset" ? "" : (v as ResidentType))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">—</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {row.security_due_this_month ? (
              <>
                <div className="space-y-2">
                  <Label>Security deposit (check-in month only)</Label>
                  <Select
                    value={securityStatus}
                    onValueChange={(v) => setSecurityStatus(v as SecurityStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(SECURITY_STATUS_LABELS) as SecurityStatus[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {SECURITY_STATUS_LABELS[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Security amount</Label>
                  <Input
                    type="number"
                    min={0}
                    value={securityAmount}
                    onChange={(e) => setSecurityAmount(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div className="sm:col-span-2 text-xs text-muted-foreground">
                Security: check-in month only
              </div>
            )}
            <div className="space-y-2">
              <Label>Monthly rent ({month})</Label>
              <Input
                type="number"
                min={0}
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
              />
              <label className="flex cursor-pointer items-start gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  className="mt-0.5 h-3.5 w-3.5 rounded border-border"
                  checked={applyRentForward}
                  onChange={(e) => setApplyRentForward(e.target.checked)}
                />
                <span>Apply to later months</span>
              </label>
            </div>
            <div className="space-y-2">
              <Label>Rent payment status</Label>
              <Select
                value={paymentStatus}
                onValueChange={(v) => setPaymentStatus(v as RentPaymentStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(RENT_PAYMENT_STATUS_LABELS) as RentPaymentStatus[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {RENT_PAYMENT_STATUS_LABELS[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={update.isPending}>
            {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MonthlyRentPage() {
  const token = useAuthStore((s) => s.token);
  const { month, setMonth, monthLabel } = useSyncedMonthFilter();
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [cohort, setCohort] = useState<ResidentRegisterCohort>("active");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [editRow, setEditRow] = useState<ResidentRegisterRow | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cnicViewer, setCnicViewer] = useState<ResidentRegisterRow | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingExcel, setDownloadingExcel] = useState(false);
  const [invoiceBookingId, setInvoiceBookingId] = useState<string | null>(null);

  const params = useMemo(
    () => ({ month, cohort, page, limit: pageSize, ...(search ? { search } : {}) }),
    [month, cohort, page, pageSize, search],
  );

  const { data, isLoading, isError } = useResidentsRegisterQuery(params);
  const residents = data?.residents ?? [];
  const pagination = data?.pagination;

  const showingFrom =
    pagination && pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
  const showingTo =
    pagination && pagination.total > 0
      ? Math.min(pagination.page * pagination.limit, pagination.total)
      : 0;

  const exportLabel = cohort === "checkouts" ? "checkouts" : "active residents";

  async function handleDownloadPdf() {
    if (!token) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingPdf(true);
    try {
      await downloadMonthRentRegisterPdfApi(token, month, cohort, search || undefined);
      toast.success(`${exportLabel} PDF downloaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "PDF download failed");
    } finally {
      setDownloadingPdf(false);
    }
  }

  async function handleDownloadExcel() {
    if (!token) {
      toast.error("You must be signed in to download");
      return;
    }
    setDownloadingExcel(true);
    try {
      await downloadMonthRentRegisterExcelApi(token, month, cohort, search || undefined);
      toast.success(`${exportLabel} Excel downloaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Excel download failed");
    } finally {
      setDownloadingExcel(false);
    }
  }

  async function handleDownloadRowInvoice(bookingId: string) {
    if (!token) {
      toast.error("You must be signed in to download");
      return;
    }
    setInvoiceBookingId(bookingId);
    try {
      await downloadResidentMonthInvoiceApi(token, bookingId, month);
      toast.success(`Rent invoice for ${monthLabel} downloaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invoice download failed");
    } finally {
      setInvoiceBookingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-0.5 sm:gap-3">
          <MonthFilterSelect
            id="rent-month"
            value={month}
            onChange={(v) => {
              setMonth(v);
              setPage(1);
            }}
            className="shrink-0"
          />
          <div className="ml-auto flex shrink-0 flex-nowrap items-center gap-2 sm:gap-3">
            <Badge variant="secondary" className="h-9 gap-1.5 px-3 whitespace-nowrap">
              <Users className="h-3.5 w-3.5" />
              {pagination?.total ?? 0} {cohort === "checkouts" ? "checkouts" : "active"}
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              disabled={downloadingPdf}
              onClick={() => void handleDownloadPdf()}
            >
              {downloadingPdf ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 shrink-0"
              disabled={downloadingExcel}
              onClick={() => void handleDownloadExcel()}
            >
              {downloadingExcel ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="mr-2 h-4 w-4" />
              )}
              Excel
            </Button>
            <div className="flex shrink-0 items-center gap-2">
              <Label
                htmlFor="rent-page-size"
                className="text-xs text-muted-foreground whitespace-nowrap"
              >
                Rows
              </Label>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  setPageSize(Number(v));
                  setPage(1);
                }}
              >
                <SelectTrigger id="rent-page-size" className="h-9 w-[4.5rem]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            setSearch(searchInput.trim());
            setPage(1);
          }}
        >
          <div className="relative min-w-0 flex-1 sm:max-w-sm">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="h-9 w-full pl-9"
              placeholder="Search name, CNIC, phone…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" className="h-9 shrink-0">
            Search
          </Button>
        </form>
      </div>

      <Card className="border-border/60">
        <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <CardTitle className="text-base">Resident list — {monthLabel}</CardTitle>
            <Tabs
              value={cohort}
              onValueChange={(v) => {
                setCohort(v as ResidentRegisterCohort);
                setPage(1);
              }}
            >
              <TabsList>
                <TabsTrigger value="active" className="gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  Active residents
                </TabsTrigger>
                <TabsTrigger value="checkouts" className="gap-1.5">
                  <LogOut className="h-3.5 w-3.5" />
                  Checkouts this month
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            {pagination && pagination.total > 0 ? (
              <p>
                Showing {showingFrom}–{showingTo} of {pagination.total}{" "}
                {cohort === "checkouts" ? "checkouts" : "active residents"}
              </p>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isError ? (
            <div className="py-12 text-center text-sm text-destructive">
              Could not load resident register.
            </div>
          ) : isLoading ? (
            <MonthlyRentTableSkeleton />
          ) : residents.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              {cohort === "checkouts" ? "No checkouts." : "No residents."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 z-10 bg-card w-10">#</TableHead>
                    <TableHead className="min-w-[6rem]">Booking</TableHead>
                    <TableHead className="min-w-[8rem]">Name</TableHead>
                    <TableHead className="min-w-[7rem]">Channel</TableHead>
                    <TableHead className="min-w-[9rem]">Email</TableHead>
                    <TableHead className="min-w-[7rem]">Contact</TableHead>
                    <TableHead className="min-w-[7.5rem]">CNIC number</TableHead>
                    <TableHead className="w-14 text-center">ID card</TableHead>
                    <TableHead className="min-w-[7.5rem]">Guardian contact</TableHead>
                    <TableHead className="min-w-[10rem]">Permanent address</TableHead>
                    <TableHead className="min-w-[7rem] max-w-[9rem]">Room</TableHead>
                    <TableHead className="w-14">Seat</TableHead>
                    <TableHead className="min-w-[5.5rem]">Check-in</TableHead>
                    <TableHead className="min-w-[5.5rem]">Check-out</TableHead>
                    <TableHead className="min-w-[5rem]">Status</TableHead>
                    <TableHead className="min-w-[5.5rem]">Security</TableHead>
                    <TableHead className="min-w-[5.5rem]">Rent</TableHead>
                    <TableHead className="min-w-[5.5rem] text-right">Amount</TableHead>
                    <TableHead className="w-10 sticky right-0 z-10 bg-card" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {residents.map((r) => (
                    <TableRow
                      key={r.booking_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setDetailId(r.booking_id)}
                    >
                      <TableCell className="sticky left-0 z-10 bg-card font-medium tabular-nums">
                        {r.serial_no}
                      </TableCell>
                      <TableCell>
                        <Link
                          to="/admin/bookings/$id"
                          params={{ id: r.booking_id }}
                          className="font-mono text-xs text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {r.booking_ref}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[9rem] font-medium">
                        <span className="block truncate" title={r.name}>
                          {r.name}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[8rem] text-xs">
                        <span className="block truncate" title={r.channel || undefined}>
                          {r.channel || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[10rem] text-xs">
                        <span
                          className="block truncate"
                          title={
                            r.email && !r.email.endsWith("@stayinn.internal") ? r.email : undefined
                          }
                        >
                          {r.email && !r.email.endsWith("@stayinn.internal") ? r.email : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs tabular-nums">
                        {r.contact_number || "—"}
                      </TableCell>
                      <TableCell className="max-w-[8rem] whitespace-nowrap text-xs tabular-nums">
                        <span className="block truncate" title={r.cnic || undefined}>
                          {r.cnic || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <CnicImagesStatusIcon
                          front={r.cnic_image_front ?? ""}
                          back={r.cnic_image_back ?? ""}
                          bForm={r.b_form_image ?? ""}
                          onClick={() => setCnicViewer(r)}
                        />
                      </TableCell>
                      <TableCell className="max-w-[8rem] whitespace-nowrap text-xs tabular-nums">
                        <span className="block truncate" title={r.guardian_contact || undefined}>
                          {r.guardian_contact || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[12rem] text-xs">
                        <span className="block truncate" title={r.permanent_address || undefined}>
                          {r.permanent_address || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[9rem]">
                        <span
                          className="block truncate text-xs"
                          title={r.room_title || r.room_seat}
                        >
                          {r.room_title || "Room"}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {r.seat_label ? `${r.seat_label}` : "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs tabular-nums">
                        {r.check_in ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs tabular-nums">
                        {r.check_out ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("whitespace-nowrap text-xs", statusBadgeClass(r.status))}
                        >
                          {r.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <InlineSecurityStatus row={r} month={month} />
                      </TableCell>
                      <TableCell>
                        <InlineRentStatus row={r} month={month} />
                      </TableCell>
                      <TableCell className="text-right font-semibold tabular-nums whitespace-nowrap text-sm">
                        {formatMoney(r.monthly_rent, r.currency)}
                      </TableCell>
                      <TableCell className="sticky right-0 z-10 bg-card">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title={`Download ${monthLabel} invoice`}
                            disabled={invoiceBookingId === r.booking_id}
                            onClick={(e) => {
                              e.stopPropagation();
                              void handleDownloadRowInvoice(r.booking_id);
                            }}
                          >
                            {invoiceBookingId === r.booking_id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Receipt className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Edit"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditRow(r);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        {pagination && pagination.total > 0 ? (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-border/60 px-4 py-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.pages} · {pagination.total} total
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="min-w-[6rem] text-center text-sm tabular-nums text-muted-foreground">
                {pagination.page} / {pagination.pages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= pagination.pages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </Card>

      <EditResidentDialog
        row={editRow}
        month={month}
        open={Boolean(editRow)}
        onOpenChange={(v) => !v && setEditRow(null)}
      />

      <CnicImagesViewerModal
        open={Boolean(cnicViewer)}
        onOpenChange={(v) => !v && setCnicViewer(null)}
        name={cnicViewer?.name}
        front={cnicViewer?.cnic_image_front ?? ""}
        back={cnicViewer?.cnic_image_back ?? ""}
        bForm={cnicViewer?.b_form_image ?? ""}
        bookingId={cnicViewer?.booking_id}
        month={month}
      />

      <ResidentDetailSheet
        bookingId={detailId}
        month={month}
        open={Boolean(detailId)}
        onOpenChange={(v) => !v && setDetailId(null)}
        onEdit={() => {
          const row = residents.find((r) => r.booking_id === detailId);
          if (row) {
            setDetailId(null);
            setEditRow(row);
          }
        }}
      />
    </div>
  );
}
