'use server';
/**
 * @fileOverview OTP generation and verification flow.
 *
 * - sendOtp - Generates and "sends" an OTP.
 * - verifyOtp - Verifies a submitted OTP.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// In a real application, this would be stored in a database or a secure cache like Redis.
// For this prototype, we'll store it in memory. This will not persist across server restarts.
const otpStore = new Map<string, { otp: string; expires: number }>();

const otpSchema = z.object({
  email: z.string().email(),
});

export async function sendOtp(
  input: z.infer<typeof otpSchema>
): Promise<{ success: boolean; message: string }> {
  const { email } = input;
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expires = Date.now() + 10 * 60 * 1000; // OTP expires in 10 minutes

  otpStore.set(email, { otp, expires });

  console.log(`OTP for ${email}: ${otp}`); // For debugging - in real life, an email would be sent.

  // Here you would integrate an email sending service (e.g., SendGrid, Nodemailer)
  // For now, we simulate success.
  return { success: true, message: 'OTP sent successfully.' };
}

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

export async function verifyOtp(
  input: z.infer<typeof verifyOtpSchema>
): Promise<{ success: boolean; message: string }> {
  const { email, otp } = input;
  const storedOtpData = otpStore.get(email);

  if (!storedOtpData) {
    return { success: false, message: 'OTP not found or expired. Please request a new one.' };
  }

  if (Date.now() > storedOtpData.expires) {
    otpStore.delete(email);
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (storedOtpData.otp === otp) {
    otpStore.delete(email); // OTP is single-use
    return { success: true, message: 'OTP verified successfully.' };
  }

  return { success: false, message: 'Invalid OTP.' };
}
