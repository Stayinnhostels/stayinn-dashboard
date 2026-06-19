/** Legacy Mongo fields kept for migration — not accepted by PUT /settings schema. */
export const LEGACY_PROPERTY_SETTINGS_KEYS = [
  "aboutValue1Title",
  "aboutValue1Desc",
  "aboutValue1Icon",
  "aboutValue2Title",
  "aboutValue2Desc",
  "aboutValue2Icon",
  "aboutValue3Title",
  "aboutValue3Desc",
  "aboutValue3Icon",
  "aboutValue4Title",
  "aboutValue4Desc",
  "aboutValue4Icon",
] as const;

export function stripLegacyPropertySettingsKeys<T extends Record<string, unknown>>(
  input: T,
): Partial<T> {
  const out = { ...input };
  for (const key of LEGACY_PROPERTY_SETTINGS_KEYS) {
    delete out[key];
  }
  return out;
}
