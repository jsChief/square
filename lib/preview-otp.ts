export const PREVIEW_OTP_KEY = "square-preview-otp";

export function isPreviewOtp(value: string | null): value is string {
  return Boolean(value && /^\d{6}$/.test(value));
}
