import { NextResponse } from "next/server";
import { db } from "@/db";
import { rapat, tindakLanjut } from "@/db/schema";
import { eq, sql, and, count } from "drizzle-orm";

export async function GET() {
  try {
    // Total rapat
    const totalRapat = await db.select({ count: count() }).from(rapat);
    
    // Rapat by status
    const rapatByStatus = await db
      .select({
        status: rapat.statusRapat,
        count: count(),
      })
      .from(rapat)
      .groupBy(rapat.statusRapat);

    // Rapat by jenis
    const rapatByJenis = await db
      .select({
        jenis: rapat.jenisRapat,
        count: count(),
      })
      .from(rapat)
      .groupBy(rapat.jenisRapat);

    // Rapat by unit
    const rapatByUnit = await db
      .select({
        unit: rapat.unitPenyelenggara,
        count: count(),
      })
      .from(rapat)
      .groupBy(rapat.unitPenyelenggara);

    // Total TL
    const totalTL = await db.select({ count: count() }).from(tindakLanjut);

    // TL by status
    const tlByStatus = await db
      .select({
        status: tindakLanjut.status,
        count: count(),
      })
      .from(tindakLanjut)
      .groupBy(tindakLanjut.status);

    // TL overdue
    const tlOverdue = await db
      .select({ count: count() })
      .from(tindakLanjut)
      .where(
        and(
          sql`${tindakLanjut.deadline} < CURRENT_DATE`,
          sql`${tindakLanjut.status} != 'Selesai'`
        )
      );

    // TL by prioritas
    const tlByPrioritas = await db
      .select({
        prioritas: tindakLanjut.prioritas,
        count: count(),
      })
      .from(tindakLanjut)
      .groupBy(tindakLanjut.prioritas);

    // Recent rapat
    const recentRapat = await db
      .select()
      .from(rapat)
      .orderBy(sql`${rapat.createdAt} DESC`)
      .limit(5);

    return NextResponse.json({
      totalRapat: totalRapat[0].count,
      rapatByStatus,
      rapatByJenis,
      rapatByUnit,
      totalTL: totalTL[0].count,
      tlByStatus,
      tlOverdue: tlOverdue[0].count,
      tlByPrioritas,
      recentRapat,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
