export const settingsKeys = {
  all: ["settings"] as const,
  property: () => [...settingsKeys.all, "property"] as const,
  propertyPublic: () => [...settingsKeys.all, "property", "public"] as const,
};
