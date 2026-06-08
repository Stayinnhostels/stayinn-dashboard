import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchResidentApi } from "@/api/residents";
import { residentKeys } from "@/queries/keys/resident.keys";
import { expenseKeys } from "@/queries/keys/expense.keys";
import { bookingKeys } from "@/queries/keys/booking.keys";
import { paymentKeys } from "@/queries/payments";
import { useAuthStore } from "@/stores/auth/auth.store";
import type { UpdateResidentInput } from "@/types/domain/resident.types";

export function useUpdateResidentMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, input }: { bookingId: string; input: UpdateResidentInput }) => {
      if (!token) throw new Error("You must be signed in");
      return patchResidentApi(token, bookingId, input);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: residentKeys.all }),
        queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
        queryClient.invalidateQueries({ queryKey: bookingKeys.revenue() }),
        queryClient.invalidateQueries({ queryKey: [...bookingKeys.all, "overview"] }),
        queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
      ]);
      await queryClient.refetchQueries({ queryKey: expenseKeys.all, type: "active" });
      await queryClient.refetchQueries({ queryKey: bookingKeys.revenue(), type: "active" });
    },
  });
}
