import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tindakLanjut } from "@/db/schema";
import { eq, and, lte, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const pic = searchParams.get("pic");
    const idRapat = searchParams.get("idRapat");
    const deadline = searchParams.get("deadline");

    const conditions = [];
    if (status && status !== "all") {
      conditions.push(eq(tindakLanjut.status, status));
    }
    if (pic && pic !== "all") {
      conditions.push(eq(tindakLanjut.pic, pic));
    }
    if (idRapat) {
      conditions.push(eq(tindakLanjut.idRapat, idRapat));
    }
    if (deadline === "overdue") {
      conditions.push(
        sql`${tindakLanjut.deadline} < CURRENT_DATE AND ${tindakLanjut.status} != 'Selesai'`
      );
    } else if (deadline === "this_week") {
      conditions.push(
        sql`${tindakLanjut.deadline} BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'`
      );
    } else if (deadline === "this_month") {
      conditions.push(
        sql`${tindakLanjut.deadline} BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'`
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;
    const data = await db
      .select()
      .from(tindakLanjut)
      .where(where)
      .orderBy(desc(tindakLanjut.updatedAt));
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/tindak-lanjut error:", error);
    return NextResponse.json({ error: "Failed to fetch tindak lanjut" }, { status: 500 });
  }
}
