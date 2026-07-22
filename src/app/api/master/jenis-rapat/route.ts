import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { masterJenisRapat } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const data = await db.select().from(masterJenisRapat);
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await db.select().from(masterJenisRapat);
    const idJenis = `JR-${String(count.length + 1).padStart(3, "0")}`;
    const result = await db.insert(masterJenisRapat).values({
      idJenis,
      namaJenis: body.namaJenis,
      kodeSingkat: body.kodeSingkat,
      status: body.status || "Aktif",
    }).returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create jenis rapat" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await db
      .update(masterJenisRapat)
      .set({
        namaJenis: body.namaJenis,
        kodeSingkat: body.kodeSingkat,
        status: body.status,
      })
      .where(eq(masterJenisRapat.idJenis, body.idJenis))
      .returning();
    return NextResponse.json(result[0]);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update jenis rapat" }, { status: 500 });
  }
}
