import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { masterUnit } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(masterUnit);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await db.select().from(masterUnit);
    const idUnit = `UNIT-${String(count.length + 1).padStart(3, "0")}`;
    const result = await db.insert(masterUnit).values({
      idUnit,
      namaUnit: body.namaUnit,
      kepalaUnit: body.kepalaUnit || null,
      status: body.status || "Aktif",
    }).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await db
      .update(masterUnit)
      .set({
        namaUnit: body.namaUnit,
        kepalaUnit: body.kepalaUnit,
        status: body.status,
      })
      .where(eq(masterUnit.idUnit, body.idUnit))
      .returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update unit" }, { status: 500 });
  }
}
