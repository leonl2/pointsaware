import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/db/queries/users";
import {
  getSavedSearches,
  createSavedSearch,
  deleteSavedSearch,
} from "@/lib/db/queries/searches";

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searches = await getSavedSearches(user.id);
  return NextResponse.json({ data: searches });
}

export async function POST(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { origin, destination, departureStart, departureEnd, cabinClasses } = body;

  if (!origin || !departureStart || !departureEnd || !cabinClasses?.length) {
    return NextResponse.json(
      { error: "origin, departureStart, departureEnd, and cabinClasses are required" },
      { status: 400 }
    );
  }

  const search = await createSavedSearch(user.id, {
    origin,
    destination,
    departureStart,
    departureEnd,
    cabinClasses,
  });

  return NextResponse.json({ data: search }, { status: 201 });
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

  await deleteSavedSearch(user.id, id);
  return NextResponse.json({ success: true });
}
