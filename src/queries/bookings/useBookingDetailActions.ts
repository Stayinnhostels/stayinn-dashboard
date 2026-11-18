import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  postBookingNoteApi,
  postEmailInvoiceApi,
  postInvoiceSharedApi,
  type InvoiceShareChannel,
  postBookingPaymentApi,
  postVerifyIdApi,
  type RecordPaymentInput,
} from "@/api/bookings/bookingDetailActions.api";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { roomKeys } from "@/queries/keys/room.keys";
import { useAuthStore } from "@/stores/auth/auth.store";

function useInvalidate() {
  const qc = useQueryClient();
  return (id: string) => {
    void qc.invalidateQueries({ queryKey: bookingKeys.detail(id) });
    void qc.invalidateQueries({ queryKey: bookingKeys.all });
    void qc.invalidateQueries({ queryKey: roomKeys.all });
    void qc.invalidateQueries({ queryKey: ["residents"] });
    void qc.invalidateQueries({ queryKey: ["admin", "nav-counts"] });
    void qc.invalidateQueries({ queryKey: ["payments"] });
  };
}

/** Figma 06.10 Record payment. */
export function useRecordPaymentMutation() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: RecordPaymentInput }) => {
      if (!token) throw new Error("You must be signed in");
      return postBookingPaymentApi(token, id, input);
    },
    onSuccess: (_d, v) => invalidate(v.id),
  });
}

export function useAddBookingNoteMutation() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => {
      if (!token) throw new Error("You must be signed in");
      return postBookingNoteApi(token, id, text);
    },
    onSuccess: (_d, v) => invalidate(v.id),
  });
}

export function useVerifyIdMutation() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in");
      return postVerifyIdApi(token, id);
    },
    onSuccess: (_d, id) => invalidate(id),
  });
}

export function useEmailInvoiceMutation() {
  const token = useAuthStore((s) => s.token);
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, to }: { id: string; to?: string }) => {
      if (!token) throw new Error("You must be signed in");
      return postEmailInvoiceApi(token, id, to);
    },
    onSuccess: (_d, v) => invalidate(v.id),
  });
}

/** Fire-and-forget log for the "Sent" list; failures are ignored. */
export function useLogInvoiceSharedMutation() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; channel: InvoiceShareChannel; invoice_number?: string; to?: string }) => {
      if (!token) throw new Error("You must be signed in");
      return postInvoiceSharedApi(token, id, input);
    },
    onSuccess: (_d, v) => void qc.invalidateQueries({ queryKey: bookingKeys.detail(v.id) }),
  });
}
