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

  const input = body as {
    displayName?: unknown;
    roomCode?: unknown;
  };
  const displayName =
    typeof input.displayName === "string" ? input.displayName.trim() : "";
  const roomCode =
    typeof input.roomCode === "string" ? input.roomCode.trim().toUpperCase() : "";

  if (!displayName || displayName.length > 24) {
    return NextResponse.json({ error: "ชื่อผู้เล่นต้องมี 1–24 ตัวอักษร" }, { status: 400 });
  }
  if (!/^[A-F0-9]{6}$/.test(roomCode)) {
    return NextResponse.json({ error: "รหัสห้องต้องเป็นตัวอักษร A–F หรือเลข 0–9 จำนวน 6 ตัว" }, { status: 400 });
  }

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin.rpc("join_game_room", {
    p_user_id: authData.user.id,
    p_room_code: roomCode,
    p_display_name: displayName,
  });

  if (error) {
    const message = error.message;
    if (message.includes("room_not_found")) {
      return NextResponse.json({ error: "ไม่พบห้องนี้" }, { status: 404 });
    }
    if (message.includes("room_full")) {
      return NextResponse.json({ error: "ห้องนี้เต็มแล้ว" }, { status: 409 });
    }
    if (message.includes("room_not_joinable")) {
      return NextResponse.json({ error: "ห้องนี้เริ่มเกมไปแล้วหรือปิดรับผู้เล่น" }, { status: 409 });
    }
    console.error("join_game_room failed", error);
    return NextResponse.json({ error: "เข้าร่วมห้องไม่สำเร็จ กรุณาลองอีกครั้ง" }, { status: 500 });
  }

  const room = Array.isArray(data) ? data[0] : data;
  if (!room?.room_code || !room?.room_id || !room?.player_id) {
    return NextResponse.json({ error: "ไม่สามารถเข้าร่วมห้องได้" }, { status: 500 });
  }

  return NextResponse.json({
    roomId: room.room_id,
    roomCode: room.room_code,
    playerId: room.player_id,
  });
}
