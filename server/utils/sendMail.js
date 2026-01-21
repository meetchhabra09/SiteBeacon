import nodemailer from "nodemailer";

// Brevo SMTP transporter (uses generated SMTP key as password)
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.BREVO_SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER || "apikey",
    pass: process.env.BREVO_SMTP_PASS,
  },
});

export async function sendBeaconFailMail(to, beacon) {
  const mailOptions = {
    from: process.env.BREVO_SENDER_MAIL,
    to,
    subject: `Beacon Alert: ${beacon.title} is DOWN`,
    text: `Hello,
    
    The monitored website "${beacon.title}" (${
      beacon.url
    }) did not respond during the latest check and is currently marked as DOWN.
    
    Time detected:
    ${new Date().toLocaleString()}

    — SiteBeacon
    `,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
}

export async function sendOtpMail(to, otp) {
  const mailOptions = {
    from: process.env.BREVO_SENDER_MAIL,
    to,
    subject: "Your SiteBeacon Login OTP",
    text: `Your OTP for login is ${otp}. It is valid for 5 minutes.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("OTP email failed");
  }
}
