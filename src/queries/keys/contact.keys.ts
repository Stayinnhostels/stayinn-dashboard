import type { ContactMessageListParams } from "@/types/domain/contact.types";

export const contactMessageKeys = {
  all: ["contact-messages"] as const,
  list: (params: ContactMessageListParams) => [...contactMessageKeys.all, "list", params] as const,
};
