const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendMail({ to, subject, text }) {
  const response = await fetch(BREVO_API_URL, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify({
      sender: {
        name: "SiteBeacon",
        email: process.env.BREVO_SENDER_MAIL,
      },
      to: [{ email: to }],
      subject,
      textContent: text,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Brevo API Error:", data);
    throw new Error("Failed to send email");
  }

  console.log("✓ Email sent:", data.messageId);
  return data;
}

export async function sendOtpMail(to, otp) {
  return sendMail({
    to,
    subject: "Your SiteBeacon Login OTP",
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
  });
}

export async function sendBeaconFailMail(to, beacon) {
  return sendMail({
    to,
    subject: `🚨 Beacon Alert: ${beacon.title} is DOWN`,
    text: `Hello,

The monitored website "${beacon.title}" is DOWN.

URL:
${beacon.url}

Detected at:
${new Date().toLocaleString()}

— SiteBeacon`,
  });
}
