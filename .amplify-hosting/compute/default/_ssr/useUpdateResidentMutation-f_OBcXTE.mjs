import { u as useQueryClient, a as useMutation } from "../_libs/tanstack__react-query.mjs";
import { p as patchResidentApi } from "./index-KZ9vj88m.mjs";
import { r as residentKeys, e as expenseKeys } from "./resident.keys-DK2A-v-L.mjs";
import { b as bookingKeys } from "./booking.keys-CTE8dzAR.mjs";
import { p as paymentKeys } from "./usePaymentsQuery-Blc2sag1.mjs";
import { u as useAuthStore } from "./router-CXpZMrmV.mjs";
function useUpdateResidentMutation() {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bookingId, input }) => {
      if (!token) throw new Error("You must be signed in");
      return patchResidentApi(token, bookingId, input);
    },
    onSuccess: async (_data, { bookingId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: residentKeys.all }),
        queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
        queryClient.invalidateQueries({ queryKey: bookingKeys.revenue() }),
        queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) }),
        queryClient.invalidateQueries({ queryKey: [...bookingKeys.all, "overview"] }),
        queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      ]);
      await queryClient.refetchQueries({ queryKey: expenseKeys.all, type: "active" });
      await queryClient.refetchQueries({ queryKey: bookingKeys.revenue(), type: "active" });
    }
  });
}
export {
  useUpdateResidentMutation as u
};
