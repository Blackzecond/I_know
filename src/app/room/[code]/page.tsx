import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { RoomRefresh } from "@/components/room-refresh";

export const dynamic = "force-dynamic";

type RoomPageProps = {
  params: Promise<{ code: string }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const { code } = await params;
  const normalizedCode = code.toUpperCase();

  const supabase = await getSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/");

  const admin = getSupabaseAdminClient();
  const { data: room, error } = await admin
    .from("game_rooms")
    .select(
      "room_id, room_code, status, max_players, host_player_id, game_players(player_id, display_name, seat_order, auth_user_id)",
    )
    .eq("room_code", normalizedCode)
    .maybeSingle();

  if (error || !room) notFound();

  const players = (room.game_players ?? []) as Array<{
    player_id: string;
    display_name: string;
    seat_order: number;
    auth_user_id: string | null;
  }>;

  const isMember = players.some((player) => player.auth_user_id === authData.user.id);
  if (!isMember) redirect("/");

  const publicPlayers = players
    .sort((a, b) => a.seat_order - b.seat_order)
    .map(({ player_id, display_name, seat_order }) => ({
      player_id,
      display_name,
      seat_order,
    }));

  return (
    <main className="room-page">
      <RoomRefresh />
      <header className="room-header">
        <Link className="wordmark" href="/">IKYD<span>✦</span></Link>
        <span className="room-header-note">PRIVATE GAME ROOM</span>
      </header>

      <section className="lobby-panel">
        <p className="lobby-eyebrow">THE TABLE IS YOURS</p>
        <h1 className="lobby-title">Room <span>{room.room_code}</span></h1>
        <p className="lobby-description">
          {room.status === "waiting"
            ? "Invite your friends. The game begins when everyone is ready."
            : "This room is no longer waiting for players."}
        </p>

        <div className="lobby-stats">
          <div><strong>{publicPlayers.length}/{room.max_players}</strong><span>PLAYERS</span></div>
          <div><strong>{room.status === "waiting" ? "WAITING" : room.status.toUpperCase()}</strong><span>ROOM STATUS</span></div>
        </div>

        <div className="players-heading">
          <span>PLAYERS AT THE TABLE</span>
          <span>{publicPlayers.length} JOINED</span>
        </div>
        <ol className="player-list">
          {publicPlayers.map((player) => (
            <li key={player.player_id}>
              <span className="player-seat">{String(player.seat_order + 1).padStart(2, "0")}</span>
              <span className="player-name">{player.display_name}</span>
              {player.player_id === room.host_player_id ? <span className="host-tag">HOST</span> : null}
            </li>
          ))}
          {Array.from({ length: Math.max(0, room.max_players - publicPlayers.length) }).map((_, index) => (
            <li className="empty-seat" key={`empty-${index}`}>
              <span className="player-seat">—</span>
              <span className="player-name">Waiting for a player…</span>
            </li>
          ))}
        </ol>

        <div className="lobby-invite">
          <span>SHARE THIS CODE WITH YOUR FRIENDS</span>
          <strong>{room.room_code}</strong>
        </div>
        <p className="lobby-footnote">This lobby refreshes automatically while players join.</p>
        <Link className="leave-room-link" href="/">Back to home</Link>
      </section>
    </main>
  );
}
