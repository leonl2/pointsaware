import Twilio from "twilio";

let _client: ReturnType<typeof Twilio> | null = null;

function getTwilioClient() {
  if (!_client) {
    _client = Twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }
  return _client;
}

export async function sendSms(to: string, body: string): Promise<void> {
  await getTwilioClient().messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to,
  });
}
