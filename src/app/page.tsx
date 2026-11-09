"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ensureGuestSession } from "@/lib/supabase/guest";

const stars = ["✦", "✧", "✦", "✧", "✦"];

export default function Home() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(7);
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState("");

  async function createRoom() {
    setBusy("create");
    setError("");
    try {
      await ensureGuestSession();
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, maxPlayers }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "สร้างห้องไม่สำเร็จ");
      router.push(`/room/${result.roomCode}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setBusy(null);
    }
  }

  async function joinRoom() {
    setBusy("join");
    setError("");
    try {
      await ensureGuestSession();
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, roomCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "เข้าร่วมห้องไม่สำเร็จ");
      router.push(`/room/${result.roomCode}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "เกิดข้อผิดพลาด กรุณาลองอีกครั้ง");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="landing">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <Link className="wordmark" href="/">IKYD<span>✦</span></Link>
        <span className="topbar-note">A little game of hidden rules</span>
      </header>

      <section className="hero">
        <div className="eyebrow"><span /> THE TABLE IS YOURS <span /></div>
        <h1>I KNOW<span className="title-soft">…</span><br />YOU DON’T<span className="title-star">✳</span></h1>
        <p className="hero-copy">
          Everyone sees the same cards.<br />
          Only one person knows why they fit.
        </p>

        <div className="room-controls">
          <label className="name-field">
            <span>YOUR NAME</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              maxLength={24}
              placeholder="Enter your name"
              autoComplete="nickname"
            />
          </label>
          <label className="max-player-field">
            <span>ROOM SIZE</span>
            <select value={maxPlayers} onChange={(event) => setMaxPlayers(Number(event.target.value))}>
              {[3, 4, 5, 6, 7].map((count) => (
                <option key={count} value={count}>{count} PLAYERS</option>
              ))}
            </select>
          </label>
          <div className="room-action-row">
            <button
              className="primary-button"
              type="button"
              onClick={createRoom}
              disabled={busy !== null || !displayName.trim()}
            >
              {busy === "create" ? "Creating…" : "Create a room"} <span>↗</span>
            </button>
            <form
              className="join-form"
              onSubmit={(event) => {
                event.preventDefault();
                void joinRoom();
              }}
            >
              <input
                className="room-code-input"
                value={roomCode}
                onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 6))}
                maxLength={6}
                placeholder="ROOM CODE"
                aria-label="Room code"
                autoComplete="off"
              />
              <button
                className="secondary-button"
                type="submit"
                disabled={busy !== null || !displayName.trim() || roomCode.length !== 6}
              >
                {busy === "join" ? "Joining…" : "Join a room"}
              </button>
            </form>
          </div>
          {error ? <p className="room-error" role="alert">{error}</p> : null}
          <Link className="offline-home-link" href="/offline">หรือเริ่มเล่นแบบออฟไลน์ด้วยอุปกรณ์เครื่องเดียว ↗</Link>
          <p className="coming-soon">PRIVATE ROOMS · 3–7 PLAYERS</p>
        </div>
      </section>

      <section className="preview" aria-label="Character card preview">
        <div className="preview-caption"><span>THE DECK</span><span>01 — 72</span></div>
        <div className="card-fan">
          <article className="sample-card card-pink">
            <div className="card-top"><span>IKYD</span><span>01</span></div>
            <div className="animal-art">🐱</div>
            <div className="card-bottom"><strong>MOCHI</strong><b>1</b></div>
          </article>
          <article className="sample-card card-blue">
            <div className="card-top"><span>IKYD</span><span>02</span></div>
            <div className="animal-art">🐸</div>
            <div className="card-bottom"><strong>RIBBIT</strong><b>4</b></div>
          </article>
          <article className="sample-card card-gold">
            <div className="card-top"><span>IKYD</span><span>03</span></div>
            <div className="animal-art">🐰</div>
            <div className="card-bottom"><strong>BUNBUN</strong><b>2</b></div>
          </article>
        </div>
        <div className="preview-foot">{stars.map((star, i) => <span key={i}>{star}</span>)}</div>
      </section>

      <footer className="footer">
        <span>MADE FOR FRIENDS, AND A LITTLE MYSTERY.</span>
        <span>3–7 PLAYERS · PRIVATE ROOMS</span>
      </footer>
    </main>
  );
}
