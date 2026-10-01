export async function sendPasswordResetEmail(email: string, token: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  const frontendUrl = process.env.FRONTEND_URL;

  if (!apiKey || !from || !frontendUrl) {
    throw new Error("Email delivery is not configured");
  }

  const link = new URL("/reset-password", frontendUrl);
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
      subject: "Reset your Kanban password",
      text:
        `Open this link within 24 hours to reset your password:\n\n` +
        `${link}\n\n` +
        `If you did not create an account, ignore this message.`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend rejected the email: ${response.status}`);
  }
}
