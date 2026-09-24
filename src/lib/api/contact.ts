import { apiClient } from "./client";

export const ESTABLISHMENT_TYPES = [
  "GARDERIE",
  "PRIMARY_SCHOOL",
  "MIDDLE_SCHOOL",
  "HIGH_SCHOOL",
  "TUTORING_CENTER",
  "TRAINING_CENTER",
] as const;

export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];

export type ContactRequestInput = {
  fullName: string;
  email: string;
  organizationName: string;
  establishmentType?: EstablishmentType;
  phone?: string;
  message: string;
  locale?: string;
  /** Honeypot — always empty for real visitors. */
  website?: string;
};

export const contactApi = {
  submit(input: ContactRequestInput) {
    return apiClient<{ received: true }>("/contact", {
      method: "POST",
      body: input,
      public: true,
      skipRefresh: true,
    });
  },
};
