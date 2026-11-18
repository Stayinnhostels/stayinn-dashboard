import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMovedOutApi, getResidentsRollApi, getRoomsBoardApi, postEmailResidentInvoiceApi, postResidentRemindersApi } from "@/api/residents/residentsRoll.api";
import { emailResidentMonthReceiptApi } from "@/api/residents";
import { residentKeys } from "@/queries/keys/resident.keys";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { MovedOutParams, RollParams, SendRemindersInput } from "@/types/domain/resident-roll.types";

export function useResidentsRollQuery(params: RollParams, options: { enabled?: boolean } = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: [...residentKeys.all, "roll", params] as const,
    queryFn: () => getResidentsRollApi(token!, params),
    enabled: Boolean(token) && (options.enabled ?? true),
    placeholderData: keepPreviousData,
  });
}

export function useMovedOutQuery(params: MovedOutParams, options: { enabled?: boolean } = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: [...residentKeys.all, "moved-out", params] as const,
    queryFn: () => getMovedOutApi(token!, params),
    enabled: Boolean(token) && (options.enabled ?? true),
    placeholderData: keepPreviousData,
  });
}

export function useSendResidentRemindersMutation() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: SendRemindersInput) => {
      if (!token) throw new Error("You must be signed in");
      return postResidentRemindersApi(token, input);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useEmailMonthReceiptMutation() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, month }: { bookingId: string; month: string }) => {
      if (!token) throw new Error("You must be signed in");
      return emailResidentMonthReceiptApi(token, bookingId, month);
    },
    onSuccess: () => void qc.invalidateQueries({ queryKey: residentKeys.all }),
  });
}

export function useRoomsBoardQuery(params: { month?: string; hostel?: string }, options: { enabled?: boolean } = {}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: [...residentKeys.all, "rooms-board", params] as const,
    queryFn: () => getRoomsBoardApi(token!, params),
    enabled: Boolean(token) && (options.enabled ?? true),
    placeholderData: keepPreviousData,
  });
}

export function useEmailResidentInvoiceMutation() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, months, note }: { bookingId: string; months: string[]; note?: string }) => {
      if (!token) throw new Error("You must be signed in");
      return postEmailResidentInvoiceApi(token, bookingId, { months, note });
    },
    onSuccess: (_d, v) => {
      void qc.invalidateQueries({ queryKey: bookingKeys.detail(v.bookingId) });
      void qc.invalidateQueries({ queryKey: residentKeys.all });
    },
  });
}
