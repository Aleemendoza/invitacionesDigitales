import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/public-guest-server";
import { planDetails, type Plan } from "@/lib/event-drafts";

export const runtime = "nodejs";
const MAX_BYTES = 3_500_000;

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "Iniciá sesión para subir fotos." }, { status: 401 });

    const db = getAdminSupabase();
    const { data: auth } = await db.auth.getUser(token);
    const { eventId } = await params;
    const { data: event } = await db.from("events").select("id,plan").eq("id", eventId).eq("owner_id", auth.user?.id ?? "").maybeSingle();
    if (!event) return NextResponse.json({ error: "Evento no encontrado." }, { status: 404 });

    const form = await request.formData(); const maxFiles=planDetails[event.plan as Plan].galleryLimit;
    const files = form.getAll("photos").filter((value): value is File => value instanceof File).slice(0, maxFiles ?? Number.MAX_SAFE_INTEGER);
    if (!files.length || files.some((file) => !file.type.startsWith("image/") || file.size > MAX_BYTES)) {
      return NextResponse.json({ error: `Subí imágenes válidas de máximo 8 MB${maxFiles ? ` (hasta ${maxFiles} por carga)` : ""}.` }, { status: 400 });
    }

    const { data: existingMedia, error: existingMediaError } = await db.from("event_media").select("position").eq("event_id", eventId).order("position", { ascending: false }).limit(1);
    if (existingMediaError) throw existingMediaError;
    const existingCount=existingMedia?.length??0; if(maxFiles!==null&&existingCount+files.length>maxFiles)return NextResponse.json({error:`Tu plan permite hasta ${maxFiles} imágenes.`},{status:400}); const firstUpload = !existingMedia?.length;
    const nextPosition = existingMedia?.[0]?.position ?? -1;
    const uploaded: { path: string; url: string }[] = [];

    for (const [offset, file] of files.entries()) {
      const extension = file.name.split(".").pop()?.replace(/[^a-z0-9]/gi, "") || "jpg";
      const path = `${eventId}/${crypto.randomUUID()}.${extension}`;
      const { error: storageError } = await db.storage.from("event-media").upload(path, file, { contentType: file.type, upsert: false });
      if (storageError) throw storageError;
      const { data: signed } = await db.storage.from("event-media").createSignedUrl(path, 60 * 60);
      const { error: insertError } = await db.from("event_media").insert({
        event_id: eventId,
        storage_path: path,
        kind: firstUpload && offset === 0 ? "cover" : "gallery",
        position: nextPosition + offset + 1,
      });
      if (insertError) throw insertError;
      uploaded.push({ path, url: signed?.signedUrl ?? "" });
    }

    return NextResponse.json({ media: uploaded });
  } catch (error) {
    console.error("upload event media", error);
    return NextResponse.json({ error: "No pudimos subir las fotos." }, { status: 500 });
  }
}
