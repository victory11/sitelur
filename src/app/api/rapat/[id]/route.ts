import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { rapat, tindakLanjut, logAktivitas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rapatData = await db.select().from(rapat).where(eq(rapat.idRapat, id));
    if (rapatData.length === 0) {
      return NextResponse.json({ error: "Rapat not found" }, { status: 404 });
    }
    const tlData = await db
      .select()
      .from(tindakLanjut)
      .where(eq(tindakLanjut.idRapat, id));
    return NextResponse.json({ ...rapatData[0], tindakLanjutList: tlData });
  } catch (error) {
    console.error("GET /api/rapat/[id] error:", error);
    return NextResponse.json({ error: "Failed to fetch rapat" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updated = await db
      .update(rapat)
      .set({
        tanggal: body.tanggal,
        jamMulai: body.jamMulai,
        jamSelesai: body.jamSelesai || null,
        tempat: body.tempat || null,
        namaRapat: body.namaRapat,
        jenisRapat: body.jenisRapat || null,
        sifatRapat: body.sifatRapat || null,
        metodeRapat: body.metodeRapat || null,
        kategoriAgenda: body.kategoriAgenda || null,
        pimpinanRapat: body.pimpinanRapat || null,
        notulis: body.notulis || null,
        unitPenyelenggara: body.unitPenyelenggara || null,
        peserta: body.peserta || [],
        agendaRapat: body.agendaRapat || null,
        pembahasanRapat: body.pembahasanRapat || null,
        keputusanRapat: body.keputusanRapat || null,
        statusRapat: body.statusRapat || "Draft",
        updatedAt: new Date(),
      })
      .where(eq(rapat.idRapat, id))
      .returning();

    // Update tindak lanjut: delete old ones and insert new
    if (body.tindakLanjut !== undefined) {
      await db.delete(tindakLanjut).where(eq(tindakLanjut.idRapat, id));
      for (const tl of body.tindakLanjut || []) {
        await db.insert(tindakLanjut).values({
          idTl: tl.idTl || generateId("TL"),
          idRapat: id,
          nomorRapat: updated[0]?.nomorRapat || null,
          uraianTindakLanjut: tl.uraian || tl.uraianTindakLanjut,
          pic: tl.pic || null,
          unitPelaksana: tl.unitPelaksana || null,
          deadline: tl.deadline || null,
          prioritas: tl.prioritas || "Sedang",
          status: tl.status || "Belum Dilaksanakan",
          catatanUpdate: tl.catatanUpdate || null,
          updatedBy: body.createdBy || "admin@rsud.go.id",
        });
      }
    }

    await db.insert(logAktivitas).values({
      userEmail: body.createdBy || "admin@rsud.go.id",
      aksi: "UPDATE",
      idTarget: id,
      detail: `Update rapat: ${body.namaRapat}`,
    });

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("PUT /api/rapat/[id] error:", error);
    return NextResponse.json({ error: "Failed to update rapat" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await db.delete(tindakLanjut).where(eq(tindakLanjut.idRapat, id));
    await db.delete(rapat).where(eq(rapat.idRapat, id));
    await db.insert(logAktivitas).values({
      userEmail: "admin@rsud.go.id",
      aksi: "DELETE",
      idTarget: id,
      detail: `Hapus rapat: ${id}`,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/rapat/[id] error:", error);
    return NextResponse.json({ error: "Failed to delete rapat" }, { status: 500 });
  }
}
