import React, { useEffect, useState, useRef } from "react";

// MemoryGame.jsx
// Tailwind CSS + React (JavaScript)
// Default export: MemoryGame component

// 👇 Images public/images folder me rakho
const IMAGES = [
  "/images/apple.jpg",
  "/images/banana.jpg",
  "/images/grap.jpg",
  "/images/strawberry.jpg",
  "/images/cherry.jpg",
  "/images/pineapple.jpg",
  "/images/kiwi.jpg",
  "/images/watermelon.jpg",
];

function shuffleArray(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryGame() {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);
  const [lockBoard, setLockBoard] = useState(false);
  const [best, setBest] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("memory_best")) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    initGame();
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [running]);

  useEffect(() => {
    if (cards.length && matched.size === cards.length) {
      setRunning(false);
      const score = computeScore();
      if (!best || score > best.score) {
        const newBest = {
          score,
          moves,
          seconds,
          date: new Date().toISOString(),
        };
        setBest(newBest);
        try {
          localStorage.setItem("memory_best", JSON.stringify(newBest));
        } catch {}
      }
    }
  }, [matched]);

  function initGame() {
    clearInterval(timerRef.current);
    setRunning(false);
    setSeconds(0);
    setMoves(0);
    setMatched(new Set());
    setFlipped([]);

    const pairSet = IMAGES.slice(0, 8);
    const doubled = shuffleArray([...pairSet, ...pairSet]).map((img, idx) => ({
      id: idx,
      img,
    }));
    setCards(doubled);
    setLockBoard(false);
  }

  function startIfNeeded() {
    if (!running) setRunning(true);
  }

  function handleCardClick(idx) {
    if (lockBoard) return;
    if (flipped.includes(idx)) return;
    if (matched.has(idx)) return;

    startIfNeeded();

    const newFlipped = [...flipped, idx];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newFlipped;
      if (cards[a].img === cards[b].img) {
        setMatched((prev) => new Set(prev).add(a).add(b));
        setFlipped([]);
      } else {
        setLockBoard(true);
        setTimeout(() => {
          setFlipped([]);
          setLockBoard(false);
        }, 700);
      }
    }
  }

  function computeScore() {
    const matchCount = cards.length / 2;
    const timePenalty = Math.max(0, seconds - matchCount * 5);
    const movePenalty = Math.max(0, moves - matchCount);
    const base = 1000;
    const score = Math.max(
      0,
      Math.round(base - timePenalty * 5 - movePenalty * 8)
    );
    return score;
  }

  function restart() {
    initGame();
  }

  function shuffleAndRestart() {
    setCards((c) => shuffleArray(c));
    setMatched(new Set());
    setFlipped([]);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
  }

  const gridCols = "grid-cols-4";

  return (
    <div className="max-w-3xl mx-auto p-4">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Memory Card Game</h1>
        <div className="text-sm text-gray-600">Match pairs — train your memory!</div>
      </header>

      <section className="mb-4 bg-white p-4 rounded-2xl shadow-md">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-4 items-center">
            <div className="text-center">
              <div className="text-xs text-gray-500">Time</div>
              <div className="font-mono text-lg">
                {new Date(seconds * 1000).toISOString().substr(14, 5)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Moves</div>
              <div className="font-bold text-lg">{moves}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500">Matches</div>
              <div className="font-bold text-lg">
                {matched.size / 2}/{cards.length / 2 || 0}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={restart}
              className="px-3 py-1 bg-orange-500 text-white rounded-lg shadow-sm hover:brightness-90"
            >
              Restart
            </button>
            <button
              onClick={shuffleAndRestart}
              className="px-3 py-1 border rounded-lg hover:bg-gray-50"
            >
              Shuffle
            </button>
          </div>
        </div>
      </section>

      <main>
        <div className={`grid ${gridCols} gap-3`}>
          {cards.map((card, idx) => {
            const isFlipped = flipped.includes(idx) || matched.has(idx);
            return (
              <button
                key={card.id + "-" + idx}
                onClick={() => handleCardClick(idx)}
                className="relative w-full aspect-square rounded-xl perspective-none focus:outline-none"
                aria-label={`card-${idx}`}
              >
                <div
                  className={`w-full h-full relative preserve-3d transition-transform duration-500 ${
                    isFlipped ? "rotate-y-180" : ""
                  }`}
                >
 
                  <div className="absolute inset-0 backface-hidden flex items-center justify-center rounded-xl bg-gray-200">
                    <div className="text-xl text-gray-600">enjoy</div>
                  </div>

                  {/* front (image) */}
                  <div className="absolute inset-0 backface-hidden flex items-center justify-center rounded-xl shadow-inner bg-gradient-to-tr from-green-100 to-green-50 transform rotate-y-180">
                    <img src={card.img} alt="card" className="w-30 h-30 object-contain" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <footer className="mt-6 text-sm text-gray-700">
          <div>
            Score: <span className="font-bold">{computeScore()}</span>
          </div>
          {best && (
            <div className="mt-2 text-xs text-gray-500">
              Best: {best.score} — {best.moves} moves in{" "}
              {new Date(best.seconds * 1000).toISOString().substr(14, 5)}
            </div>
          )}
        </footer>
      </main>

      <style>{`
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .transition-transform { transition-property: transform; }
      `}</style>
    </div>
  );
}
