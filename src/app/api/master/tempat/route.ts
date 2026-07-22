import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { masterTempat } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(masterTempat);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await db.select().from(masterTempat);
    const idTempat = `TMP-${String(count.length + 1).padStart(3, "0")}`;
    const result = await db.insert(masterTempat).values({
      idTempat,
      namaTempat: body.namaTempat,
      kapasitas: body.kapasitas ? parseInt(body.kapasitas) : null,
      status: body.status || "Aktif",
    }).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create tempat" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await db
      .update(masterTempat)
      .set({
        namaTempat: body.namaTempat,
        kapasitas: body.kapasitas ? parseInt(body.kapasitas) : null,
        status: body.status,
      })
      .where(eq(masterTempat.idTempat, body.idTempat))
      .returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update tempat" }, { status: 500 });
  }
}
