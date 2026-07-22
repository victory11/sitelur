import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tindakLanjut, logAktivitas } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db
      .update(tindakLanjut)
      .set({
        status: body.status,
        catatanUpdate: body.catatanUpdate || null,
        updatedBy: body.updatedBy || "admin@rsud.go.id",
        updatedAt: new Date(),
      })
      .where(eq(tindakLanjut.idTl, id))
      .returning();

    await db.insert(logAktivitas).values({
      userEmail: body.updatedBy || "admin@rsud.go.id",
      aksi: "UPDATE",
      idTarget: id,
      detail: `Update TL status: ${body.status}`,
    });

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("PUT /api/tindak-lanjut/[id] error:", error);
    return NextResponse.json({ error: "Failed to update TL" }, { status: 500 });
  }
}
