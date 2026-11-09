"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  addRuleCardForNextGuess,
  exchangeWholeHand,
  guessRoundRule,
  playCards,
} from "@/lib/game/actions";
import { RULE_CARDS, type CharacterCard } from "@/lib/game/catalog";
import {
  advanceOfflineGame,
  endOfflineGameEarly,
  startOfflineGame,
  updateOfflineGameRound,
  type OfflineGameState,
} from "@/lib/game/match";
import type { GameParticipant } from "@/lib/game/setup";
import { AnimalArt, CardBack, RuleEmblem } from "@/components/game/animal-art";

const ANIMAL_LABELS: Record<CharacterCard["animal"], string> = {
  cat: "แมว",
  rabbit: "กระต่าย",
  frog: "กบ",
  fox: "สุนัขจิ้งจอก",
};
const COLOR_LABELS: Record<CharacterCard["color"], string> = {
  pink: "ชมพู",
  blue: "ฟ้า",
  gold: "ทอง",
};

function CardFace({
  card,
  selected,
  onClick,
  disabled = false,
}: {
  card: CharacterCard;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`offline-card card-${card.color}${selected ? " is-selected" : ""}`}
      type="button"
      onClick={onClick}
      disabled={disabled || !onClick}
      aria-pressed={selected}
    >
      <span className="offline-card-top"><span>IKYD</span><span>{card.id.slice(-2)}</span></span>
      <span className="offline-card-art"><AnimalArt animal={card.animal} /></span>
      <span className="offline-card-bottom">
        <span>{ANIMAL_LABELS[card.animal]}</span>
        <strong>{card.number}</strong>
      </span>
      <span className="offline-card-color"><i />{COLOR_LABELS[card.color]}</span>
    </button>
  );
}

function PlayerName({
  players,
  playerId,
}: {
  players: GameParticipant[];
  playerId: string;
}) {
  return <>{players.find((player) => player.id === playerId)?.displayName ?? "ผู้เล่น"}</>;
}

export default function OfflinePage() {
  const [playerCount, setPlayerCount] = useState(4);
  const [names, setNames] = useState(["ผู้เล่น 1", "ผู้เล่น 2", "ผู้เล่น 3", "ผู้เล่น 4", "ผู้เล่น 5", "ผู้เล่น 6", "ผู้เล่น 7"]);
  const [startingKeeper, setStartingKeeper] = useState("p1");
  const [game, setGame] = useState<OfflineGameState | null>(null);
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [keeperPlayableIds, setKeeperPlayableIds] = useState<string[] | null>(null);
  const [handoffTo, setHandoffTo] = useState<string | null>(null);
  const [keeperBriefing, setKeeperBriefing] = useState(false);
  const [choosingNextSecret, setChoosingNextSecret] = useState(false);
  const [nextSecretRule, setNextSecretRule] = useState(RULE_CARDS[0].id);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  const round = game?.currentRound;
  const players = game?.players ?? [];
  const currentPlayer = round?.players.find((player) => player.id === round.currentPlayerId);
  const currentHand = round && currentPlayer ? round.hands[currentPlayer.id] : [];
  const guessState = round?.ruleGuessState;
  const waitingForKeeperReplacement = Boolean(guessState?.awaitingKeeperChoice);
  const currentGuesserId = round?.pendingGuesserId;
  const isGuessing = round?.phase === "guessing";
  const isRoundComplete = round?.phase === "complete";
  const isMatchComplete = game?.phase === "complete";

  const totals = useMemo(
    () => players.map((player) => ({ ...player, points: game?.totalScores[player.id] ?? 0 }))
      .sort((a, b) => b.points - a.points),
    [game?.totalScores, players],
  );

  function updateGameWithRound(updatedRound: typeof round) {
    if (!game || !updatedRound) return;
    setGame(updateOfflineGameRound(game, updatedRound));
  }

  function startGame() {
    const participants: GameParticipant[] = names.slice(0, playerCount).map((displayName, index) => ({
      id: `p${index + 1}`,
      displayName: displayName.trim() || `ผู้เล่น ${index + 1}`,
      seatOrder: index,
    }));
    const keeperId = participants.some((player) => player.id === startingKeeper)
      ? startingKeeper
      : participants[0].id;
    const firstSecret = RULE_CARDS[Math.floor(Math.random() * RULE_CARDS.length)].id;
    try {
      const next = startOfflineGame({
        players: participants,
        startingRuleKeeperId: keeperId,
        firstSecretRuleId: firstSecret,
      });
      setGame(next);
      setHandoffTo(keeperId);
      setKeeperBriefing(true);
      setSelectedCards([]);
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "เริ่มเกมไม่สำเร็จ");
    }
  }

  function finishTurn(updatedRound: NonNullable<typeof round>) {
    updateGameWithRound(updatedRound);
    setSelectedCards([]);
    setKeeperPlayableIds(null);
    if (updatedRound.phase === "guessing") {
      setHandoffTo(updatedRound.ruleGuessState?.awaitingKeeperChoice
        ? updatedRound.ruleKeeperId
        : updatedRound.pendingGuesserId ?? null);
    } else if (updatedRound.phase === "playing") {
      setHandoffTo(updatedRound.currentPlayerId);
    } else {
      setHandoffTo(null);
    }
    setNotice("");
  }

  function submitPlay() {
    if (!round || !currentPlayer || selectedCards.length === 0) return;
    setBusy(true);
    try {
      const result = playCards(round, currentPlayer.id, selectedCards);
      finishTurn(result.state);
      if (!result.accepted) setNotice("ไพ่ชุดนี้ไม่ผ่านกฎ ไพ่กลับเข้ามือและจบเทิร์น");
      else setNotice(result.state.phase === "guessing" ? "ผู้เล่นหมดมือแล้ว เริ่มช่วงทายกฎ" : "ลงไพ่สำเร็จ");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ลงไพ่ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  function submitExchange() {
    if (!round || !currentPlayer) return;
    setBusy(true);
    try {
      const result = exchangeWholeHand(round, currentPlayer.id);
      if (result.reason === "keeper_selection_required") {
        setKeeperPlayableIds(result.playableCardIds ?? []);
        setHandoffTo(round.ruleKeeperId);
        setNotice("ส่งไพ่ให้ผู้คุมกฎตรวจแล้ว กรุณาส่งอุปกรณ์ให้ผู้คุมกฎ");
      } else {
        finishTurn(result.state);
        setNotice(result.state.phase === "guessing"
          ? "กองจั่วหมดหรือผู้เล่นหมดมือแล้ว เริ่มทายกฎ"
          : "ผู้คุมกฎตรวจแล้ว ไม่มีไพ่ที่ลงได้");
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "แลกไพ่ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  function keeperSelectPlayable(cardId: string) {
    if (!round || !currentPlayer) return;
    setBusy(true);
    try {
      const result = exchangeWholeHand(round, currentPlayer.id, cardId);
      finishTurn(result.state);
      setNotice("ผู้คุมกฎเลือกไพ่และผู้เล่นจั่วไพ่ชดเชยแล้ว");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ยืนยันไพ่ไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  }

  function makeGuess(ruleId: string) {
    if (!round || !currentGuesserId) return;
    try {
      const result = guessRoundRule(round, currentGuesserId, ruleId);
      finishTurn(result.state);
      setNotice(result.correct
        ? `${players.find((player) => player.id === currentGuesserId)?.displayName} ทายถูก! ได้โบนัส 1 คะแนน`
        : "ทายผิด ผู้คุมกฎต้องเพิ่มไพ่กฎใหม่ก่อนส่งให้คนถัดไป");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "ทายกฎไม่สำเร็จ");
    }
  }

  function keeperAddRule(ruleId: string) {
    if (!round) return;
    try {
      const updated = addRuleCardForNextGuess(round, round.ruleKeeperId, ruleId);
      updateGameWithRound(updated);
      setHandoffTo(updated.pendingGuesserId ?? null);
      setNotice("เพิ่มตัวเลือกแล้ว ส่งอุปกรณ์ให้ผู้เล่นคนถัดไป");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "เพิ่มไพ่กฎไม่สำเร็จ");
    }
  }

  function continueAfterHandoff() {
    if (handoffTo) {
      setHandoffTo(null);
      return;
    }
    if (keeperBriefing) {
      setKeeperBriefing(false);
      setHandoffTo(round?.currentPlayerId ?? null);
      return;
    }
    setNotice("");
  }

  function startNextRound() {
    if (!game) return;
    try {
      const next = advanceOfflineGame(game, nextSecretRule);
      setGame(next);
      setChoosingNextSecret(false);
      setNextSecretRule(RULE_CARDS.find((rule) => rule.id !== nextSecretRule)?.id ?? RULE_CARDS[0].id);
      if (next.phase !== "complete") {
        setHandoffTo(null);
        setKeeperBriefing(true);
      } else {
        setHandoffTo(null);
      }
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "เริ่มรอบถัดไปไม่สำเร็จ");
    }
  }

  function beginNextSecretSelection() {
    if (!round) return;
    const keeperIndex = players.findIndex((player) => player.id === round.ruleKeeperId);
    const nextKeeper = players[(keeperIndex + 1) % players.length];
    setChoosingNextSecret(true);
    setHandoffTo(nextKeeper.id);
    setNotice("");
  }

  function quitEarly() {
    if (!game) return;
    setGame(endOfflineGameEarly(game));
    setHandoffTo(null);
  }

  if (!game) {
    return (
      <main className="offline-page">
        <header className="offline-header">
          <Link className="wordmark" href="/">IKYD<span>✦</span></Link>
          <span className="offline-header-note">OFFLINE · PASS & PLAY</span>
        </header>
        <section className="offline-setup-panel">
          <p className="offline-eyebrow">NO INTERNET NEEDED</p>
          <h1 className="offline-title">เริ่มเกม <span>ออฟไลน์</span></h1>
          <p className="offline-copy">เล่นด้วยอุปกรณ์เครื่องเดียว ส่งต่อให้ผู้เล่นตามลำดับ</p>

          <label className="offline-field">
            <span>จำนวนผู้เล่น</span>
            <select value={playerCount} onChange={(event) => {
              const count = Number(event.target.value);
              setPlayerCount(count);
              if (Number(startingKeeper.slice(1)) > count) setStartingKeeper("p1");
            }}>
              {[3, 4, 5, 6, 7].map((count) => <option key={count} value={count}>{count} คน</option>)}
            </select>
          </label>

          <div className="offline-player-fields">
            {names.slice(0, playerCount).map((name, index) => (
              <label className="offline-field" key={index}>
                <span>ผู้เล่น {index + 1}</span>
                <input value={name} maxLength={20} onChange={(event) => {
                  setNames((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item));
                }} />
              </label>
            ))}
          </div>

          <label className="offline-field">
            <span>ผู้คุมกฎรอบแรก</span>
            <select value={startingKeeper} onChange={(event) => setStartingKeeper(event.target.value)}>
              {names.slice(0, playerCount).map((name, index) => (
                <option key={index} value={`p${index + 1}`}>{name.trim() || `ผู้เล่น ${index + 1}`}</option>
              ))}
            </select>
          </label>
          <button className="offline-primary" type="button" onClick={startGame}>เริ่มเกม <span>↗</span></button>
          <p className="offline-small-note">กติกาและคะแนนจะถูกจัดการในเครื่องนี้ ไม่มีการสร้างห้องออนไลน์</p>
        </section>
      </main>
    );
  }

  if (isMatchComplete) {
    return (
      <main className="offline-page">
        <header className="offline-header">
          <Link className="wordmark" href="/">IKYD<span>✦</span></Link>
          <span className="offline-header-note">MATCH COMPLETE</span>
        </header>
        <section className="offline-panel">
          <p className="offline-eyebrow">THE TABLE HAS SPOKEN</p>
          <h1 className="offline-title">สรุปผล <span>การแข่งขัน</span></h1>
          <div className="offline-score-list">
            {totals.map((player, index) => (
              <div className="offline-score-row" key={player.id}>
                <strong className="offline-rank">{index + 1}</strong>
                <span>{player.displayName}</span>
                <b>{player.points > 0 ? "+" : ""}{player.points}</b>
              </div>
            ))}
          </div>
          <p className="offline-copy">เล่นจบ {game.roundsCompleted} จาก {game.roundsToPlay} รอบ</p>
          <button className="offline-primary" type="button" onClick={() => {
            setGame(null); setHandoffTo(null); setKeeperPlayableIds(null); setChoosingNextSecret(false); setKeeperBriefing(false); setNotice("");
          }}>กลับหน้าตั้งค่าเกม</button>
        </section>
      </main>
    );
  }

  const handoffPlayer = handoffTo ? players.find((player) => player.id === handoffTo) : null;
  const isKeeperSelection = keeperPlayableIds !== null;
  const isKeeperReplacement = waitingForKeeperReplacement;
  const isGuessingHandoff = isGuessing && !waitingForKeeperReplacement && handoffTo === currentGuesserId;

  if (handoffTo) {
    return (
      <main className="offline-page">
        <header className="offline-header">
          <Link className="wordmark" href="/">IKYD<span>✦</span></Link>
          <span className="offline-header-note">PASS & PLAY · ROUND {round?.roundNumber}</span>
        </header>
        <section className="offline-panel handoff-panel">
          <p className="offline-eyebrow">PRIVATE SCREEN</p>
          <div className="handoff-symbol">✦</div>
          <h1 className="offline-title">ส่งอุปกรณ์ให้</h1>
          <h2 className="handoff-name">
            {isKeeperSelection || isKeeperReplacement || keeperBriefing
              ? "ผู้คุมกฎ"
              : handoffPlayer?.displayName ?? "ผู้เล่น"}
          </h2>
          <p className="offline-copy">
            {keeperBriefing
              ? "ผู้คุมกฎดูไพ่กฎลับให้เรียบร้อย ก่อนส่งอุปกรณ์ให้ผู้เล่นคนแรก"
              : isKeeperSelection
                ? "ผู้คุมกฎเท่านั้นที่ควรดูไพ่ในมือและเลือกไพ่ที่ผ่านกฎ"
                : isKeeperReplacement
                  ? "ผู้คุมกฎเลือกไพ่กฎใหม่เพื่อเติมตัวเลือกให้ครบ"
                  : isGuessingHandoff
                    ? "ถึงเวลาทายกฎลับแล้ว"
                    : "เมื่อพร้อมแล้ว ให้ผู้เล่นที่ระบุรับอุปกรณ์"}
          </p>
          <button className="offline-primary" type="button" onClick={continueAfterHandoff}>
            {keeperBriefing ? "เปิดหน้าผู้คุมกฎ" : choosingNextSecret ? "เลือกกฎลับ" : "พร้อมแล้ว"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="offline-page">
      <header className="offline-header">
        <Link className="wordmark" href="/">IKYD<span>✦</span></Link>
        <span className="offline-header-note">OFFLINE · ROUND {round?.roundNumber}/{game.roundsToPlay}</span>
      </header>

      {notice ? <p className="offline-notice" role="status">{notice}</p> : null}

      {choosingNextSecret ? (
        <section className="offline-panel">
          <p className="offline-eyebrow">NEXT RULE KEEPER ONLY</p>
          <h1 className="offline-title">เลือกกฎลับ <span>รอบถัดไป</span></h1>
          <p className="offline-copy">เลือกไพ่กฎหนึ่งใบ แล้วอย่าให้ผู้เล่นคนอื่นเห็น</p>
          <div className="offline-rule-options">
            {RULE_CARDS.map((rule) => (
              <button
                className={`offline-rule-option${nextSecretRule === rule.id ? " is-rule-selected" : ""}`}
                key={rule.id}
                onClick={() => setNextSecretRule(rule.id)}
              >
                <RuleEmblem ruleId={rule.id} /><strong>{rule.title}</strong><span>{rule.description}</span>
              </button>
            ))}
          </div>
          <button className="offline-primary" type="button" onClick={startNextRound}>ยืนยันกฎลับและเริ่มรอบ</button>
        </section>
      ) : null}

      {keeperBriefing ? (
        <section className="offline-panel">
          <p className="offline-eyebrow">RULE KEEPER ONLY</p>
          <h1 className="offline-title">กฎลับของรอบนี้</h1>
          <div className="offline-rule-secret">
            <strong>{round?.secretRule.title}</strong>
            <span>{round?.secretRule.description}</span>
          </div>
          <button className="offline-primary" type="button" onClick={continueAfterHandoff}>ซ่อนกฎและส่งต่อ</button>
        </section>
      ) : null}

      {isKeeperSelection ? (
        <section className="offline-panel">
          <p className="offline-eyebrow">RULE KEEPER ONLY</p>
          <h1 className="offline-title">เลือกไพ่ที่ <span>ผ่านกฎ</span></h1>
          <p className="offline-copy">ไพ่เหล่านี้ผ่านเงื่อนไข ผู้คุมกฎเลือกลงได้หนึ่งใบ</p>
          <div className="offline-card-grid">
            {keeperPlayableIds.map((id) => {
              const card = round?.hands[round.currentPlayerId].find((item) => item.id === id);
              return card ? <CardFace key={id} card={card} onClick={() => keeperSelectPlayable(id)} /> : null;
            })}
          </div>
        </section>
      ) : null}

      {isKeeperReplacement ? (
        <section className="offline-panel">
          <p className="offline-eyebrow">RULE KEEPER ONLY</p>
          <h1 className="offline-title">เพิ่มไพ่กฎ</h1>
          <p className="offline-copy">เลือกไพ่กฎที่ยังไม่ถูกใช้หนึ่งใบ</p>
          <div className="offline-rule-options">
            {guessState?.unusedRuleIds.map((id) => {
              const rule = RULE_CARDS.find((item) => item.id === id);
              return rule ? <button className="offline-rule-option" key={id} onClick={() => keeperAddRule(id)}>{rule.title}</button> : null;
            })}
          </div>
        </section>
      ) : null}

      {isGuessing && !waitingForKeeperReplacement && !isRoundComplete ? (
        <section className="offline-panel">
          <p className="offline-eyebrow">GUESS THE SECRET RULE</p>
          <h1 className="offline-title">ทายกฎลับ</h1>
          <p className="offline-copy">
            ถึงตา <strong><PlayerName players={players} playerId={currentGuesserId ?? ""} /></strong>
            {" "}· เลือกกฎที่คิดว่าถูกต้อง
          </p>
          <div className="offline-rule-options">
            {guessState?.choices.map((rule) => (
              <button className="offline-rule-option" key={rule.id} onClick={() => makeGuess(rule.id)}>
                <strong>{rule.title}</strong><span>{rule.description}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {isRoundComplete && !choosingNextSecret ? (
        <section className="offline-panel">
          <p className="offline-eyebrow">ROUND {round?.roundNumber} COMPLETE</p>
          <h1 className="offline-title">ผลคะแนน <span>ประจำรอบ</span></h1>
          <div className="offline-score-list">
            {round?.roundScore?.players.map((score) => {
              const player = players.find((item) => item.id === score.playerId);
              return (
                <div className="offline-score-row" key={score.playerId}>
                  <strong className="offline-rank">{score.rank ?? "–"}</strong>
                  <span>{player?.displayName}{score.isRuleKeeper ? " · ผู้คุมกฎ" : ""}</span>
                  <b>{score.points > 0 ? "+" : ""}{score.points}</b>
                </div>
              );
            })}
          </div>
          <p className="offline-copy">ผู้ทายถูก: {guessState?.correctGuesserId
            ? players.find((player) => player.id === guessState.correctGuesserId)?.displayName
            : "—"}</p>
          {game.roundsCompleted + 1 < game.roundsToPlay && round?.endReason !== "draw_pile_exhausted" ? (
            <button className="offline-primary" type="button" onClick={beginNextSecretSelection}>
              ส่งอุปกรณ์ให้ผู้คุมกฎรอบถัดไปเพื่อเลือกกฎ
            </button>
          ) : (
            <button className="offline-primary" type="button" onClick={() => {
              const final = advanceOfflineGame(game);
              setGame(final);
            }}>ดูผลรวมการแข่งขัน</button>
          )}
        </section>
      ) : null}

      {round?.phase === "playing" && !keeperBriefing && !isKeeperSelection && !isKeeperReplacement ? (
        <>
          <section className="offline-table-panel">
            <div className="offline-turn-top">
              <div><span>TURN</span><strong>{currentPlayer?.displayName}</strong></div>
              <div><span>RULE KEEPER</span><strong>{players.find((player) => player.id === round.ruleKeeperId)?.displayName}</strong></div>
              <div><span>DRAW PILE</span><strong className="offline-draw-count"><CardBack className="offline-draw-back" /><span>{round.drawPile.length}</span></strong></div>
            </div>
            <div className="offline-table-heading">
              <div><p className="offline-eyebrow">ON THE TABLE</p><h2>ไพ่คำใบ้และไพ่ที่ลงแล้ว</h2></div>
              <span>{round.tableCards.length} ใบ</span>
            </div>
            <div className="offline-table-cards">
              {round.tableCards.slice(-5).map((card) => <CardFace key={card.id} card={card} disabled />)}
            </div>
          </section>

          <section className="offline-panel offline-hand-panel">
            <p className="offline-eyebrow">YOUR HAND · {currentHand.length} CARDS</p>
            <h1 className="offline-title">เลือกไพ่ที่จะลง</h1>
            <p className="offline-copy">เลือกได้หลายใบตามลำดับที่ต้องการ ไพ่ทุกใบต้องผ่านกฎ</p>
            <div className="offline-card-grid">
              {currentHand.map((card) => (
                <CardFace
                  key={card.id}
                  card={card}
                  selected={selectedCards.includes(card.id)}
                  onClick={() => setSelectedCards((current) => current.includes(card.id)
                    ? current.filter((id) => id !== card.id)
                    : [...current, card.id])}
                />
              ))}
            </div>
            <div className="offline-action-row">
              <button className="offline-primary" type="button" onClick={submitPlay} disabled={!selectedCards.length || busy}>
                ลงไพ่ที่เลือก ({selectedCards.length})
              </button>
              <button className="offline-secondary" type="button" onClick={submitExchange} disabled={busy}>
                แลกไพ่ทั้งมือ
              </button>
            </div>
          </section>
        </>
      ) : null}

      <footer className="offline-footer">
        <span>{game.roundsCompleted} รอบที่จบแล้ว</span>
        <button type="button" onClick={quitEarly}>จบเกมก่อนกำหนด</button>
      </footer>
    </main>
  );
}
