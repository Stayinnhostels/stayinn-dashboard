import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  collectDepositApi,
  deleteDepositDocumentApi,
  depositRemindersApi,
  getDepositApi,
  getDepositsApi,
  keepDepositApi,
  logDepositShareApi,
  planDepositApi,
  returnDepositApi,
  uploadDepositDocumentApi,
} from "@/api/security/securityDeposits.api";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { residentKeys } from "@/queries/keys/resident.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { CollectDepositInput, DepositsParams, ReturnDepositInput } from "@/types/domain/security-deposits.types";

export const depositKeys = {
  all: ["security-deposits"] as const,
  list: (p: DepositsParams) => ["security-deposits", "list", p] as const,
  detail: (id: string) => ["security-deposits", "detail", id] as const,
};

function useToken() {
  const token = useAuthStore((s) => s.token);
  return token;
}
function need(token: string | null | undefined): string {
  if (!token) throw new Error("You must be signed in");
  return token;
}

export function useDepositsQuery(params: DepositsParams, enabled = true) {
  const token = useToken();
  return useQuery({ queryKey: depositKeys.list(params), queryFn: () => getDepositsApi(token!, params), enabled: Boolean(token) && enabled, placeholderData: keepPreviousData });
}

export function useDepositQuery(id: string | null) {
  const token = useToken();
  return useQuery({ queryKey: depositKeys.detail(id ?? ""), queryFn: () => getDepositApi(token!, id!), enabled: Boolean(token) && Boolean(id) });
}

function useInvalidate() {
  const qc = useQueryClient();
  return (bookingId?: string) => {
    void qc.invalidateQueries({ queryKey: depositKeys.all });
    void qc.invalidateQueries({ queryKey: ["payments"] });
    void qc.invalidateQueries({ queryKey: residentKeys.all });
    void qc.invalidateQueries({ queryKey: ["admin", "nav-counts"] });
    if (bookingId) void qc.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
  };
}

function useDepositMutation<V extends { id: string }, R>(fn: (token: string, v: V) => Promise<R>) {
  const token = useToken();
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (v: V) => fn(need(token), v), onSuccess: (_d, v) => invalidate(v.id) });
}

export const useCollectDepositMutation = () => useDepositMutation((t, v: { id: string; input: CollectDepositInput }) => collectDepositApi(t, v.id, v.input));
export const useReturnDepositMutation = () => useDepositMutation((t, v: { id: string; input: ReturnDepositInput }) => returnDepositApi(t, v.id, v.input));
export const usePlanDepositMutation = () => useDepositMutation((t, v: { id: string; amount: number | null; note?: string }) => planDepositApi(t, v.id, { amount: v.amount, note: v.note }));
export const useKeepDepositMutation = () =>
  useDepositMutation((t, v: { id: string; input: Parameters<typeof keepDepositApi>[2] }) => keepDepositApi(t, v.id, v.input));
export const useLogDepositShareMutation = () =>
  useDepositMutation((t, v: { id: string; input: Parameters<typeof logDepositShareApi>[2] }) => logDepositShareApi(t, v.id, v.input));
export const useUploadDepositDocumentMutation = () =>
  useDepositMutation((t, v: { id: string; input: Parameters<typeof uploadDepositDocumentApi>[2] }) => uploadDepositDocumentApi(t, v.id, v.input));
export const useDeleteDepositDocumentMutation = () => useDepositMutation((t, v: { id: string; docId: string }) => deleteDepositDocumentApi(t, v.id, v.docId));

export function useDepositRemindersMutation() {
  const token = useToken();
  const invalidate = useInvalidate();
  return useMutation({ mutationFn: (ids: string[]) => depositRemindersApi(need(token), ids), onSuccess: () => invalidate() });
}
