"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const PHOTOS = ["/1.webp", "/2.webp", "/3.webp", "/4.webp", "/5.webp"];
const YOUTUBE_ID = "cJLH5yXoqi8";

export default function Home() {
  const [started, setStarted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [current, setCurrent] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const startedRef = useRef(false);

  const lastIndex = PHOTOS.length - 1;

  // Envia comandos para o player do YouTube (já pré-carregado tocando mudo).
  function ytCommand(func: string, args: unknown[] = []) {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: "command", func, args }),
      "https://www.youtube.com"
    );
  }

  function handleStart() {
    setStarted(true);
    startedRef.current = true;
    // player já está pronto e tocando mudo -> som sai na hora
    ytCommand("seekTo", [19, true]);
    ytCommand("unMute");
    ytCommand("playVideo");
  }

  // Escuta o player: só revela as fotos/textos quando o vídeo REALMENTE tocar.
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (typeof e.origin !== "string" || !e.origin.includes("youtube.com"))
        return;
      let data: unknown = e.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      const d = data as { event?: string; info?: { playerState?: number } | number };
      const state =
        typeof d.info === "number" ? d.info : d.info?.playerState;
      // playerState === 1 => tocando
      if (startedRef.current && state === 1) setRevealed(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  // Segurança: se o navegador não reportar o play, revela mesmo assim.
  useEffect(() => {
    if (!started) return;
    const t = setTimeout(() => setRevealed(true), 8000);
    return () => clearTimeout(t);
  }, [started]);

  // Avança as fotos (tempo por foto). A 4ª dura 3s menos para encurtar a
  // segunda frase; as demais ficam 13s. Para na última (a 5ª).
  useEffect(() => {
    if (!revealed || current >= lastIndex) return;
    const photoMs = [13000, 13000, 13000, 10000];
    const t = setTimeout(
      () => setCurrent((prev) => prev + 1),
      photoMs[current] ?? 13000
    );
    return () => clearTimeout(t);
  }, [revealed, current, lastIndex]);

  // Na última foto, depois de um tempo, alterna para a frase final sozinha.
  useEffect(() => {
    if (!revealed || current !== lastIndex) return;
    const t = setTimeout(() => setShowFinal(true), 9000);
    return () => clearTimeout(t);
  }, [revealed, current, lastIndex]);

  return (
    <div className="scene">
      {/* Corações flutuantes de fundo */}
      <div className="hearts" aria-hidden>
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="heart" style={{ ["--i" as string]: i }}>
            ♥
          </span>
        ))}
      </div>

      {/* Player do YouTube (escondido) — pré-carregado tocando mudo para
          eliminar o delay; o clique só faz unmute + play */}
      <iframe
        ref={iframeRef}
        className="hidden-player"
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${YOUTUBE_ID}?enablejsapi=1&autoplay=1&mute=1&controls=0&rel=0&playsinline=1&start=19`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />

      {!started && (
        <button className="start" onClick={handleStart}>
          <PlayButton />
          <span className="start-text">toque para iniciar ♥</span>
        </button>
      )}

      {started && !revealed && (
        <div className="loading">
          <div className="loading-dots" aria-hidden>
            <span />
            <span />
            <span />
          </div>
          <span className="loading-text">carregando meu amor por você</span>
        </div>
      )}

      {revealed && (
        <>
          <div className="playing">
            <h1 className="title">Lucas &amp; Raíssa</h1>

            <div className="frame">
              {PHOTOS.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt={`Nós dois — foto ${i + 1}`}
                  fill
                  priority={i <= 1}
                  sizes="(max-width: 420px) 80vw, 340px"
                  className={`photo ${i === current ? "photo-active" : ""}`}
                />
              ))}
              <div className="frame-glow" />
            </div>

            <div className="letter-slot">
              <p
                className={`letter ${
                  current < 2 ? "letter-visible" : ""
                }`}
              >
                Obrigado por todos esses anos, foram os melhores da minha vida.
                Você é o maior presente que a vida poderia me dar. Não consigo
                viver em um mundo sem ter você ao meu lado.{" "}
                <span className="letter-highlight">
                  É um amor que nunca senti por ninguém e nem por nada.
                </span>
              </p>
              <p
                className={`letter ${
                  current >= 2 && current < lastIndex ? "letter-visible" : ""
                }`}
              >
                Desde o primeiro dia, desde a primeira conversa, eu sabia que
                seria você. Eu nunca duvidei disso,{" "}
                <span className="letter-highlight">
                  e a cada dia sinto mais isso.
                </span>
              </p>
              <p
                className={`letter ${
                  current === lastIndex && !showFinal ? "letter-visible" : ""
                }`}
              >
                Eu sonho com o dia em que essa foto vai se tornar real e vamos
                ser um só, finalmente. Durante todos esses anos eu sonhei com
                isso.{" "}
                <span className="letter-highlight">
                  Eu sinto agora, como sempre senti, que você é quem me completa.
                </span>
              </p>
              <p
                className={`letter letter-solo ${
                  showFinal ? "letter-visible" : ""
                }`}
              >
                <span className="letter-highlight">
                  Você será para sempre a dama da minha vida.
                </span>
              </p>
            </div>

            <div className="nowplaying">
              <div className="equalizer" aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </div>
              <div className="song">
                <span className="song-title">The Lady in My Life</span>
                <span className="song-artist">Michael Jackson</span>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{styles}</style>
    </div>
  );
}

function PlayButton() {
  return (
    <div className="playbtn">
      <div className="playbtn-ring" />
      <div className="playbtn-triangle" />
    </div>
  );
}

const styles = `
  :root { color-scheme: dark; }

  .scene {
    position: relative;
    flex: 1;
    width: 100%;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: radial-gradient(1200px 800px at 50% -10%, #4a1030 0%, #2a0a1e 45%, #140510 100%);
    font-family: var(--font-geist-sans), system-ui, sans-serif;
    padding: 24px;
  }

  /* ---------- Corações de fundo ---------- */
  .hearts { position: absolute; inset: 0; pointer-events: none; }
  .heart {
    position: absolute;
    bottom: -40px;
    left: calc(var(--i) * 11%);
    color: rgba(255, 120, 170, 0.35);
    font-size: calc(16px + (var(--i) * 2px));
    animation: floatUp 14s linear infinite;
    animation-delay: calc(var(--i) * -1.4s);
  }
  @keyframes floatUp {
    0%   { transform: translateY(0) scale(0.6); opacity: 0; }
    10%  { opacity: 1; }
    90%  { opacity: 1; }
    100% { transform: translateY(-105vh) scale(1.1); opacity: 0; }
  }

  /* ---------- Player escondido ---------- */
  .hidden-player {
    position: absolute;
    width: 1px;
    height: 1px;
    opacity: 0;
    pointer-events: none;
    border: 0;
    left: -9999px;
  }

  /* ---------- Botão inicial ---------- */
  .start {
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    background: none;
    border: none;
    cursor: pointer;
    color: #ffe3ef;
    animation: fadeIn 1s ease both;
  }
  .start:hover .playbtn { transform: scale(1.08); }
  .start-text {
    font-size: clamp(20px, 4vw, 30px);
    font-weight: 600;
    letter-spacing: 0.03em;
    text-shadow: 0 2px 18px rgba(255, 90, 150, 0.5);
    animation: pulse 2.2s ease-in-out infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 0.75; transform: translateY(0); }
    50%      { opacity: 1; transform: translateY(-3px); }
  }

  /* ---------- Carregando ---------- */
  .loading {
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 22px;
    color: #ffe3ef;
    animation: fadeIn 0.6s ease both;
  }
  .loading-text {
    font-size: clamp(18px, 3.6vw, 26px);
    font-weight: 600;
    letter-spacing: 0.02em;
    text-shadow: 0 2px 18px rgba(255, 90, 150, 0.5);
  }
  .loading-dots {
    display: flex;
    gap: 10px;
  }
  .loading-dots span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: radial-gradient(circle at 35% 30%, #ff9ec4, #d6336c);
    animation: dotPulse 1.2s ease-in-out infinite;
  }
  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPulse {
    0%, 100% { transform: scale(0.6); opacity: 0.5; }
    50%      { transform: scale(1); opacity: 1; }
  }

  /* ---------- Conteúdo tocando ---------- */
  .playing {
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 28px;
    max-width: 640px;
    width: 100%;
    animation: fadeIn 1.2s ease both;
  }

  /* ---------- Botão de play ---------- */
  .playbtn {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at 35% 28%, #ff7eb3, #d6336c);
    box-shadow: 0 18px 50px rgba(214, 51, 108, 0.5), inset 0 2px 0 rgba(255,255,255,0.35);
    transition: transform 0.3s ease;
  }
  .playbtn-triangle {
    width: 0;
    height: 0;
    margin-left: 8px;
    border-style: solid;
    border-width: 22px 0 22px 36px;
    border-color: transparent transparent transparent #fff;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));
  }
  .playbtn-ring {
    position: absolute;
    inset: -12px;
    border-radius: 50%;
    border: 2px solid rgba(255, 158, 196, 0.55);
    animation: ringPulse 2.2s ease-out infinite;
    will-change: transform, opacity;
  }
  @keyframes ringPulse {
    0%   { transform: scale(1); opacity: 0.7; }
    100% { transform: scale(1.4); opacity: 0; }
  }

  /* ---------- Título ---------- */
  .title {
    font-family: var(--font-cursive), cursive;
    font-size: clamp(22px, 4vw, 30px);
    font-weight: 400;
    color: #ffd9e8;
    letter-spacing: 0.02em;
    text-shadow: 0 2px 16px rgba(255, 90, 150, 0.45);
    margin-bottom: -6px;
  }

  /* ---------- Moldura das fotos ---------- */
  .frame {
    position: relative;
    width: min(80vw, 340px);
    height: min(80vw, 340px);
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    contain: paint;
  }
  .photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transform: scale(1.08) translateZ(0);
    backface-visibility: hidden;
    visibility: hidden;
    transition: opacity 1s ease, transform 13s ease, visibility 0s linear 1s;
  }
  .photo-active {
    opacity: 1;
    transform: scale(1) translateZ(0);
    visibility: visible;
    will-change: transform, opacity;
    transition: opacity 1s ease, transform 13s ease, visibility 0s linear 0s;
  }
  .frame-glow {
    position: absolute; inset: 0;
    border-radius: 18px;
    box-shadow: inset 0 0 60px rgba(255, 100, 160, 0.25);
    pointer-events: none;
  }

  /* ---------- Cartinha ---------- */
  .letter-slot {
    position: relative;
    width: 100%;
    /* espaço reservado para o texto não empurrar a foto */
    min-height: clamp(150px, 24vh, 190px);
  }
  .letter {
    position: absolute;
    inset: 0;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    color: #ffe0ec;
    font-size: clamp(13px, 2vw, 16px);
    line-height: 1.7;
    text-align: center;
    letter-spacing: 0.01em;
    text-shadow: 0 2px 14px rgba(0,0,0,0.4);
    padding: 0 8px;
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.9s ease, transform 0.9s ease;
    pointer-events: none;
  }
  .letter-visible {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
  .letter-highlight {
    display: inline-block;
    margin-top: 8px;
    font-weight: 700;
    font-size: 1.12em;
    color: #ff9ec4;
    text-shadow: 0 2px 18px rgba(255, 90, 150, 0.6);
  }
  .letter-solo {
    transition: opacity 1.9s ease, transform 1.9s ease;
  }
  .letter-solo .letter-highlight {
    margin-top: 0;
    font-size: clamp(20px, 4vw, 30px);
    line-height: 1.4;
  }

  /* ---------- Tocando agora ---------- */
  .nowplaying {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 20px;
    border-radius: 999px;
    background: rgba(24, 8, 16, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 8px 30px rgba(0,0,0,0.35);
  }
  .equalizer {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    height: 24px;
  }
  .equalizer span {
    width: 4px;
    height: 24px;
    border-radius: 2px;
    background: linear-gradient(180deg, #ff9ec4, #d6336c);
    transform-origin: bottom center;
    animation: eq 1s ease-in-out infinite;
  }
  .equalizer span:nth-child(1) { animation-delay: -0.5s; }
  .equalizer span:nth-child(2) { animation-delay: -0.2s; }
  .equalizer span:nth-child(3) { animation-delay: -0.7s; }
  .equalizer span:nth-child(4) { animation-delay: -0.3s; }
  @keyframes eq {
    0%, 100% { transform: scaleY(0.25); }
    50%      { transform: scaleY(1); }
  }
  .song {
    display: flex;
    flex-direction: column;
    line-height: 1.25;
    text-align: left;
  }
  .song-title {
    color: #fff;
    font-weight: 600;
    font-size: 15px;
  }
  .song-artist {
    color: rgba(255, 224, 236, 0.7);
    font-size: 13px;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
