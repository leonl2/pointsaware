import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/db/queries/users";
import { getUnreadCount } from "@/lib/db/queries/notifications";

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const count = await getUnreadCount(user.id);
  return NextResponse.json({ count });
}
