import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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

  await resend.emails.send({
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
