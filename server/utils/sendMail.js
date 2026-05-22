const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

export async function sendMail({ to, subject, text, htmlContent }) {
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
      htmlContent: htmlContent || undefined,
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

export async function sendAnalyticsEmail(to, beaconTitle, analyticsData) {
  const htmlContent = generateAnalyticsEmailTemplate(beaconTitle, analyticsData);
  return sendMail({
    to,
    subject: `📊 Analytics Report: ${beaconTitle}`,
    text: `Analytics Report for ${beaconTitle}\n\nUptime: ${analyticsData.uptimePercentage}%\nDowntime Events: ${analyticsData.downCount}\nNotifications: ${analyticsData.notificationCount}\nAverage Response Time: ${analyticsData.avgResponseTime}ms`,
    htmlContent
  });
}

function generateAnalyticsEmailTemplate(beaconTitle, analyticsData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header p { margin: 5px 0 0 0; opacity: 0.9; }
        .metrics { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .metric { background: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; }
        .metric-label { color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
        .metric-value { font-size: 24px; font-weight: bold; color: #333; }
        .metric-subtitle { color: #999; font-size: 12px; margin-top: 5px; }
        .chart-container { margin: 20px 0; text-align: center; }
        .chart-container img { max-width: 100%; height: auto; border-radius: 6px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px; }
        .status-up { border-left-color: #10b981; }
        .status-down { border-left-color: #ef4444; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Analytics Report</h1>
          <p>${beaconTitle}</p>
        </div>
        
        <div style="padding: 20px;">
          <p>Hello,</p>
          <p>Here's your beacon analytics report for <strong>${beaconTitle}</strong>:</p>
          
          <div class="metrics">
            <div class="metric ${analyticsData.uptimePercentage >= 95 ? 'status-up' : 'status-down'}">
              <div class="metric-label">Uptime</div>
              <div class="metric-value">${analyticsData.uptimePercentage}%</div>
              <div class="metric-subtitle">Last 30 days</div>
            </div>
            
            <div class="metric ${analyticsData.downCount === 0 ? 'status-up' : 'status-down'}">
              <div class="metric-label">Downtime Events</div>
              <div class="metric-value">${analyticsData.downCount}</div>
              <div class="metric-subtitle">Last 30 days</div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Notifications</div>
              <div class="metric-value">${analyticsData.notificationCount}</div>
              <div class="metric-subtitle">Last 30 days</div>
            </div>
            
            <div class="metric">
              <div class="metric-label">Avg Response Time</div>
              <div class="metric-value">${analyticsData.avgResponseTime}ms</div>
              <div class="metric-subtitle">Last 30 days</div>
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <strong style="color: #1e40af;">Pro Tip:</strong> Log in to SiteBeacon to view detailed analytics and configure more alerts.
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} SiteBeacon. All rights reserved.</p>
          <p>You received this email because you have enabled analytics reports in your preferences.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
