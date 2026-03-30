import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

const FROM_EMAIL = "PointsAware <alerts@pointsaware.com>";

export async function sendAlertEmail(
  to: string,
  alert: {
    origin: string;
    destination: string | null;
    cabinClasses: string[];
    alertType: string;
    thresholdPoints: number | null;
  },
  deal: {
    airline: string;
    pointsPrice: number;
    departureDate: string;
  }
) {
  const route = `${alert.origin} → ${alert.destination ?? "Anywhere"}`;
  const cabins = alert.cabinClasses.join(", ");
  const subject =
    alert.alertType === "price_drop"
      ? `Price Drop: ${route} now ${deal.pointsPrice.toLocaleString()} pts`
      : `New Availability: ${route} ${cabins}`;

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4a853;">✈️ ${subject}</h2>
        <div style="background: #1a2332; padding: 20px; border-radius: 12px; color: #e8e0d0;">
          <p><strong>Route:</strong> ${route}</p>
          <p><strong>Airline:</strong> ${deal.airline}</p>
          <p><strong>Price:</strong> ${deal.pointsPrice.toLocaleString()} points</p>
          <p><strong>Cabin:</strong> ${cabins}</p>
          <p><strong>Date:</strong> ${deal.departureDate}</p>
        </div>
        <p style="margin-top: 20px;">
          <a href="https://pointsaware.vercel.app/search?origin=${alert.origin}${alert.destination ? `&destination=${alert.destination}` : ""}"
             style="background: #d4a853; color: #0f1729; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View Deal
          </a>
        </p>
        <p style="color: #8899aa; font-size: 12px; margin-top: 30px;">
          You received this because you set up a ${alert.alertType.replace("_", " ")} alert on PointsAware.
        </p>
      </div>
    `,
  });
}

export async function sendDigestEmail(
  to: string,
  deals: Array<{
    origin: string;
    destination: string;
    airline: string;
    cabinClass: string;
    pointsPrice: number;
  }>
) {
  if (deals.length === 0) return;

  const dealRows = deals
    .slice(0, 5)
    .map(
      (d) =>
        `<tr>
          <td style="padding: 8px; color: #e8e0d0;">${d.origin} → ${d.destination}</td>
          <td style="padding: 8px; color: #e8e0d0;">${d.airline}</td>
          <td style="padding: 8px; color: #e8e0d0;">${d.cabinClass}</td>
          <td style="padding: 8px; color: #d4a853; font-weight: bold;">${d.pointsPrice.toLocaleString()} pts</td>
        </tr>`
    )
    .join("");

  await getResend().emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Your Daily Flight Deals — ${deals.length} opportunities`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4a853;">✈️ Your Daily Digest</h2>
        <p style="color: #8899aa;">Today's best award flight deals based on your saved searches:</p>
        <table style="width: 100%; border-collapse: collapse; background: #1a2332; border-radius: 12px; overflow: hidden;">
          <thead>
            <tr style="border-bottom: 1px solid #2d3748;">
              <th style="padding: 10px 8px; text-align: left; color: #8899aa; font-size: 11px; text-transform: uppercase;">Route</th>
              <th style="padding: 10px 8px; text-align: left; color: #8899aa; font-size: 11px; text-transform: uppercase;">Airline</th>
              <th style="padding: 10px 8px; text-align: left; color: #8899aa; font-size: 11px; text-transform: uppercase;">Cabin</th>
              <th style="padding: 10px 8px; text-align: left; color: #8899aa; font-size: 11px; text-transform: uppercase;">Price</th>
            </tr>
          </thead>
          <tbody>${dealRows}</tbody>
        </table>
        <p style="margin-top: 20px;">
          <a href="https://pointsaware.vercel.app/deals"
             style="background: #d4a853; color: #0f1729; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
            View All Deals
          </a>
        </p>
        <p style="color: #8899aa; font-size: 12px; margin-top: 30px;">
          You received this because you enabled daily digest emails on PointsAware.
        </p>
      </div>
    `,
  });
}
