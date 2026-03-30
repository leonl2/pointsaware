import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/db/queries/users";
import {
  getUserAlerts,
  getActiveAlertCount,
  createAlert,
  updateAlert,
  deleteAlert,
} from "@/lib/db/queries/alerts";

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [alertsList, activeCount] = await Promise.all([
    getUserAlerts(user.id),
    getActiveAlertCount(user.id),
  ]);

  return NextResponse.json({ data: alertsList, activeCount });
}

export async function POST(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { searchId, alertType, thresholdPoints, channels } = body;

  if (!searchId || !alertType || !channels?.length) {
    return NextResponse.json(
      { error: "searchId, alertType, and channels are required" },
      { status: 400 }
    );
  }

  if (!["price_drop", "availability"].includes(alertType)) {
    return NextResponse.json(
      { error: "alertType must be price_drop or availability" },
      { status: 400 }
    );
  }

  if (alertType === "price_drop" && (!thresholdPoints || thresholdPoints <= 0)) {
    return NextResponse.json(
      { error: "thresholdPoints is required for price_drop alerts" },
      { status: 400 }
    );
  }

  const validChannels = ["email", "push", "in_app", "sms"];
  if (!channels.every((c: string) => validChannels.includes(c))) {
    return NextResponse.json(
      { error: `channels must be one of: ${validChannels.join(", ")}` },
      { status: 400 }
    );
  }

  const alert = await createAlert({
    userId: user.id,
    searchId,
    alertType,
    thresholdPoints,
    channels,
  });

  return NextResponse.json({ data: alert }, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, isActive, thresholdPoints, channels } = body;

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const updated = await updateAlert(user.id, id, {
    ...(typeof isActive === "boolean" ? { isActive } : {}),
    ...(thresholdPoints ? { thresholdPoints } : {}),
    ...(channels ? { channels } : {}),
  });

  if (!updated) {
    return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  }

  return NextResponse.json({ data: updated });
}

export async function DELETE(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  await deleteAlert(user.id, id);
  return NextResponse.json({ success: true });
}
