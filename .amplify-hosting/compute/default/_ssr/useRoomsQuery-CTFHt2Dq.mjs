import { b as useQuery } from "../_libs/tanstack__react-query.mjs";
import { a as apiFetch } from "./apiFetch-Cc9rh5iq.mjs";
import { r as roomKeys } from "./room.keys-BMDsz0NU.mjs";
async function getRoomsApi(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.status) search.set("status", params.status);
  if (params.search?.trim()) search.set("search", params.search.trim());
  const q = search.toString();
  const data = await apiFetch(`/api/v1/rooms${q ? `?${q}` : ""}`);
  if (!data.success || !Array.isArray(data.rooms)) {
    throw new Error("Invalid rooms list response");
  }
  return data;
}
function useRoomsQuery(params, options = {}) {
  return useQuery({
    queryKey: roomKeys.list(params),
    queryFn: () => getRoomsApi(params),
    staleTime: 3e4,
    enabled: options.enabled ?? true
  });
}
export {
  useRoomsQuery as u
};
