import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteExpenseApi, patchExpenseApi, postExpenseApi } from "@/api/expenses";
import { expenseKeys } from "@/queries/keys/expense.keys";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { ExpenseDraft } from "@/types/domain/expense.types";

export function useCreateExpenseMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ExpenseDraft) => {
      if (!token) throw new Error("You must be signed in");
      return postExpenseApi(token, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useUpdateExpenseMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ExpenseDraft> }) => {
      if (!token) throw new Error("You must be signed in");
      return patchExpenseApi(token, id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}

export function useDeleteExpenseMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!token) throw new Error("You must be signed in");
      return deleteExpenseApi(token, id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: expenseKeys.all });
    },
  });
}
