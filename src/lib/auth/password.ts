import { z } from "zod";

export const PASSWORD_MIN = 8;

export type PasswordChecks = {
  minLength: boolean;
  hasNumber: boolean;
  hasLetter: boolean;
};

export function getPasswordChecks(password: string): PasswordChecks {
  return {
    minLength: password.length >= PASSWORD_MIN,
    hasNumber: /\d/.test(password),
    hasLetter: /[A-Za-zÀ-ÿ]/.test(password),
  };
}

export function isPasswordStrong(password: string): boolean {
  const checks = getPasswordChecks(password);
  return checks.minLength && checks.hasNumber && checks.hasLetter;
}

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN)
  .max(128)
  .refine((value) => isPasswordStrong(value), {
    message: "weak",
  });

/** Only allow internal relative paths (open-redirect safe). */
export function safeInternalPath(
  next: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  if (next.includes("://")) return fallback;
  return next;
}

export function mapAuthError(
  statusCode: number | undefined,
  fallback: string,
  messages: { generic: string; rateLimited: string },
): string {
  if (statusCode === 429) return messages.rateLimited;
  if (statusCode === 401 || statusCode === 403) return messages.generic;
  return fallback || messages.generic;
}
