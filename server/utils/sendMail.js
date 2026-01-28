import Brevo from "@getbrevo/brevo";

/**
 * ---------------------------------------------------
 * Brevo Client Configuration
 * ---------------------------------------------------
 */
const transactionalEmailApi = new Brevo.TransactionalEmailsApi();

transactionalEmailApi.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY
);

/**
 * ---------------------------------------------------
 * Generic Send Mail Function
 * (Reusable for OTP, Alerts, etc.)
 * ---------------------------------------------------
 */
export async function sendMail({ to, subject, text }) {
  const emailData = {
    sender: {
      name: "SiteBeacon",
      email: process.env.BREVO_SENDER_MAIL,
    },
    to: [{ email: to }],
    subject,
    textContent: text,
  };

  try {
    const response = await transactionalEmailApi.sendTransacEmail(emailData);
    console.log("✓ Email sent successfully:", response.messageId);
    return response;
  } catch (error) {
    console.error("✗ Email sending failed:", error);
    throw error;
  }
}

/**
 * ---------------------------------------------------
 * Send Website DOWN Alert
 * ---------------------------------------------------
 */
export async function sendBeaconFailMail(to, beacon) {
  return sendMail({
    to,
    subject: `🚨 Beacon Alert: ${beacon.title} is DOWN`,
    text: `Hello,

The monitored website "${beacon.title}" is currently DOWN.

URL:
${beacon.url}

Detected at:
${new Date().toLocaleString()}

— SiteBeacon Monitoring`,
  });
}

/**
 * ---------------------------------------------------
 * Send OTP Email
 * ---------------------------------------------------
 */
export async function sendOtpMail(to, otp) {
  return sendMail({
    to,
    subject: "Your SiteBeacon Login OTP",
    text: `Your OTP for SiteBeacon login is:

${otp}

This OTP is valid for 5 minutes.
Do not share it with anyone.

— SiteBeacon Security Team`,
  });
}
