import { apiFetch } from "@/api/apiFetch";
import type { Hostel, HostelInput } from "@/types/domain/hostel.types";

type PostHostelResponse = {
  success: boolean;
  message?: string;
  hostel?: Hostel;
};

function hostelInputToBody(input: HostelInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    name: input.name.trim(),
  };
  if (input.slug?.trim()) body.slug = input.slug.trim();
  if (input.status) body.status = input.status;
  if (input.is_default != null) body.isDefault = input.is_default;
  if (input.address != null) body.address = input.address;
  if (input.city != null) body.city = input.city;
  if (input.area != null) body.area = input.area;
  if (input.country != null) body.country = input.country;
  if (input.phone != null) body.phone = input.phone;
  if (input.email != null) body.email = input.email;
  if (input.whatsapp != null) body.whatsapp = input.whatsapp;
  if (input.map_url != null) body.mapUrl = input.map_url;
  if (input.latitude != null) body.latitude = input.latitude;
  if (input.longitude != null) body.longitude = input.longitude;
  if (input.check_in_time != null) body.checkInTime = input.check_in_time;
  if (input.check_out_time != null) body.checkOutTime = input.check_out_time;
  if (input.min_stay != null) body.minStay = input.min_stay;
  if (input.max_stay != null) body.maxStay = input.max_stay;
  if (input.advance_booking_days != null) body.advanceBookingDays = input.advance_booking_days;
  if (input.cancellation_window_hours != null) {
    body.cancellationWindowHours = input.cancellation_window_hours;
  }
  if (input.cancellation_policy != null) body.cancellationPolicy = input.cancellation_policy;
  if (input.deposit_percent != null) body.depositPercent = input.deposit_percent;
  if (input.allow_children != null) body.allowChildren = input.allow_children;
  if (input.allow_pets != null) body.allowPets = input.allow_pets;
  if (input.smoking_allowed != null) body.smokingAllowed = input.smoking_allowed;
  if (input.house_rules != null) body.houseRules = input.house_rules;
  if (input.quiet_hours_start != null) body.quietHoursStart = input.quiet_hours_start;
  if (input.quiet_hours_end != null) body.quietHoursEnd = input.quiet_hours_end;
  return body;
}

function hostelPatchToBody(input: Partial<HostelInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (input.name != null) body.name = input.name.trim();
  if (input.slug?.trim()) body.slug = input.slug.trim();
  if (input.status) body.status = input.status;
  if (input.is_default != null) body.isDefault = input.is_default;
  if (input.address != null) body.address = input.address;
  if (input.city != null) body.city = input.city;
  if (input.area != null) body.area = input.area;
  if (input.country != null) body.country = input.country;
  if (input.phone != null) body.phone = input.phone;
  if (input.email != null) body.email = input.email;
  if (input.whatsapp != null) body.whatsapp = input.whatsapp;
  if (input.map_url != null) body.mapUrl = input.map_url;
  if (input.latitude != null) body.latitude = input.latitude;
  if (input.longitude != null) body.longitude = input.longitude;
  if (input.check_in_time != null) body.checkInTime = input.check_in_time;
  if (input.check_out_time != null) body.checkOutTime = input.check_out_time;
  if (input.min_stay != null) body.minStay = input.min_stay;
  if (input.max_stay != null) body.maxStay = input.max_stay;
  if (input.advance_booking_days != null) body.advanceBookingDays = input.advance_booking_days;
  if (input.cancellation_window_hours != null) {
    body.cancellationWindowHours = input.cancellation_window_hours;
  }
  if (input.cancellation_policy != null) body.cancellationPolicy = input.cancellation_policy;
  if (input.deposit_percent != null) body.depositPercent = input.deposit_percent;
  if (input.allow_children != null) body.allowChildren = input.allow_children;
  if (input.allow_pets != null) body.allowPets = input.allow_pets;
  if (input.smoking_allowed != null) body.smokingAllowed = input.smoking_allowed;
  if (input.house_rules != null) body.houseRules = input.house_rules;
  if (input.quiet_hours_start != null) body.quietHoursStart = input.quiet_hours_start;
  if (input.quiet_hours_end != null) body.quietHoursEnd = input.quiet_hours_end;
  return body;
}

export async function postHostelApi(token: string, input: HostelInput): Promise<Hostel> {
  const data = await apiFetch<PostHostelResponse>("/api/v1/hostels", {
    method: "POST",
    token,
    body: JSON.stringify(hostelInputToBody(input)),
  });
  if (!data.success || !data.hostel) {
    throw new Error(data.message ?? "Failed to create hostel");
  }
  return data.hostel;
}

export async function patchHostelApi(
  token: string,
  id: string,
  input: Partial<HostelInput>,
): Promise<Hostel> {
  const data = await apiFetch<PostHostelResponse>(`/api/v1/hostels/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(hostelPatchToBody(input)),
  });
  if (!data.success || !data.hostel) {
    throw new Error(data.message ?? "Failed to update hostel");
  }
  return data.hostel;
}
