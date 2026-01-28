import nodemailer from "nodemailer";

// Brevo SMTP transporter (using port 465 for better cloud platform compatibility)
const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST || "smtp-relay.brevo.com",
  port: Number(process.env.BREVO_SMTP_PORT || 587),
  secure: false, // use SSL/TLS
  auth: {
    user: process.env.BREVO_SMTP_USER || process.env.BREVO_SENDER_MAIL,
    pass: process.env.BREVO_SMTP_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("SMTP Configuration Error:", error);
  } else {
    console.log("✓ SMTP Server is ready to send emails");
  }
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent to ${to}`, info.messageId);
    return info;
  } catch (error) {
    console.error(`✗ Error sending email to ${to}:`, error.message);
    console.error("Full error:", error);
    throw error;
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`✓ OTP email sent to ${to}`, info.messageId);
    return info;
  } catch (error) {
    console.error("✗ Failed to send OTP email:", error.message);
    console.error("Full error:", error);
    throw new Error("OTP email failed");
  }
}
