import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 403 });
  }

  const supabase = await getSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError || !authData.user) {
    return NextResponse.json({ error: "กรุณาเริ่มเซสชันผู้เล่นก่อน" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลคำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const input = body as { displayName?: unknown; maxPlayers?: unknown };
  const displayName =
    typeof input.displayName === "string" ? input.displayName.trim() : "";
  const maxPlayers =
    typeof input.maxPlayers === "number" ? input.maxPlayers : 7;

  if (!displayName || displayName.length > 24) {
    return NextResponse.json({ error: "ชื่อผู้เล่นต้องมี 1–24 ตัวอักษร" }, { status: 400 });
  }
  if (!Number.isInteger(maxPlayers) || maxPlayers < 3 || maxPlayers > 7) {
    return NextResponse.json({ error: "จำนวนผู้เล่นต้องอยู่ระหว่าง 3–7 คน" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.rpc("create_game_room", {
    p_user_id: authData.user.id,
    p_display_name: displayName,
    p_max_players: maxPlayers,
  });

  if (error) {
    console.error("create_game_room failed", error);
    return NextResponse.json({ error: "สร้างห้องไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
  }

  const room = Array.isArray(data) ? data[0] : data;
  if (!room?.room_code || !room?.room_id || !room?.player_id) {
    return NextResponse.json({ error: "ไม่สามารถสร้างห้องได้" }, { status: 500 });
  }

  return NextResponse.json({
    roomId: room.room_id,
    roomCode: room.room_code,
    playerId: room.player_id,
  });
}
