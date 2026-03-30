import { NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/db/queries/users";
import { getDealsForUser, getRecentDeals } from "@/lib/db/queries/deals";

export async function GET() {
  try {
    const user = await getOrCreateDbUser();
    const deals = user
      ? await getDealsForUser(user.id)
      : await getRecentDeals();
    return NextResponse.json({ data: deals });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
