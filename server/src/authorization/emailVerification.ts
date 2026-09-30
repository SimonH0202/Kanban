import { createHash, randomBytes } from "node:crypto";

export function createVerificationToken() {
  const token = randomBytes(32).toString("hex");

  return {
    token,
    hash: hashVerificationToken(token),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

export function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendVerificationEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!apiKey || !from || !frontendUrl) {
    throw new Error("Email delivery is not configured");
  }

  const link = new URL("/verify-email", frontendUrl);
  link.searchParams.set("token", token);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Verify your Kanban email address",
      text:
        `Open this link within 24 hours to verify your email:\n\n` +
        `${link}\n\n` +
        `If you did not create an account, ignore this message.`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected the email: ${response.status}`);
  }
}
