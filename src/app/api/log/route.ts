import { NextResponse } from "next/server";
import { db } from "@/db";
import { logAktivitas } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(logAktivitas)
      .orderBy(desc(logAktivitas.timestamp))
      .limit(100);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch logs" }, { status: 500 });
  }
}
