export type PropertySettings = {
  hotelName: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  mapUrl: string;
  whatsapp: string | null;
  whatsapp_url: string | null;
  fullAddress: string;
  logoUrl: string;
  coverImageUrl: string;
  primaryColor: string;
  accentColor: string;
  dashboardPrimaryColor: string;
  dashboardAccentColor: string;
  website: string;
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  linkedin: string;
  threads: string;
  checkInTime: string;
  checkOutTime: string;
  minStay: number;
  maxStay: number;
  advanceBookingDays: number;
  cancellationWindowHours: number;
  cancellationPolicy: "flexible" | "moderate" | "strict";
  depositPercent: number;
  allowChildren: boolean;
  allowPets: boolean;
  smokingAllowed: boolean;
  houseRules: string;
  quietHoursStart: string;
  quietHoursEnd: string;
};

export type PublicPropertySettings = Pick<
  PropertySettings,
  | "hotelName"
  | "tagline"
  | "description"
  | "email"
  | "phone"
  | "address"
  | "city"
  | "country"
  | "mapUrl"
  | "whatsapp"
  | "whatsapp_url"
  | "fullAddress"
  | "primaryColor"
  | "accentColor"
  | "website"
  | "instagram"
  | "facebook"
  | "twitter"
  | "youtube"
  | "linkedin"
  | "threads"
>;
