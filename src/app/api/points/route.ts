import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDbUser } from "@/lib/db/queries/users";
import { getPointsBalances, upsertPointsBalance } from "@/lib/db/queries/points";

export async function GET() {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const balances = await getPointsBalances(user.id);
  return NextResponse.json({ data: balances });
}

export async function PUT(request: NextRequest) {
  const user = await getOrCreateDbUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { program, balance } = body;

  if (!program || typeof balance !== "number" || balance < 0) {
    return NextResponse.json(
      { error: "program (string) and balance (non-negative number) are required" },
      { status: 400 }
    );
  }

  if (!["chase_ur", "amex_mr"].includes(program)) {
    return NextResponse.json(
      { error: "program must be chase_ur or amex_mr" },
      { status: 400 }
    );
  }

  const updated = await upsertPointsBalance(user.id, program, balance);
  return NextResponse.json({ data: updated });
}
