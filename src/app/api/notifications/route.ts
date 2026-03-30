import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/db/queries/users";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "@/lib/db/queries/notifications";

export async function GET(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);

  const notifs = await getUserNotifications(user.id, { limit, offset });
  return NextResponse.json({ data: notifs });
}

export async function PUT(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.all === true) {
    await markAllAsRead(user.id);
    return NextResponse.json({ success: true });
  }

  if (!body.id) {
    return NextResponse.json(
      { error: "id is required, or pass { all: true }" },
      { status: 400 }
    );
  }

  const updated = await markAsRead(user.id, body.id);
  if (!updated) {
    return NextResponse.json(
      { error: "Notification not found" },
      { status: 404 }
    );
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

  await deleteNotification(user.id, id);
  return NextResponse.json({ success: true });
}
