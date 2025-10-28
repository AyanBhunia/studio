
"use client";

import { useState, useCallback } from "react";
import { GameBoard } from "@/components/game-board";
import { GameControls } from "@/components/game-controls";
import type { Player } from "@/lib/types";

export default function Home() {
  const [gridSize, setGridSize] = useState(5);
  const [playerCount, setPlayerCount] = useState(2);
  const [cardSize, setCardSize] = useState(100);
  const [gameId, setGameId] = useState(0); 
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<"loading" | "playing" | "gameOver">("loading");


  const startNewGame = useCallback(() => {
    setGameId(prevId => prevId + 1);
  }, []);

  return (
    <main className="flex h-screen w-screen flex-col md:flex-row bg-background font-body antialiased">
      <GameControls
        gridSize={gridSize}
        setGridSize={setGridSize}
        playerCount={playerCount}
        setPlayerCount={setPlayerCount}
        cardSize={cardSize}
        setCardSize={setCardSize}
        onNewGame={startNewGame}
        players={players}
        activePlayer={activePlayer}
        winner={winner}
        gameState={gameState}
      />
      <div className="flex flex-1 items-center justify-center p-4 overflow-auto">
        <GameBoard
          key={gameId}
          gridSize={gridSize}
          playerCount={playerCount}
          cardSize={cardSize}
          setPlayers={setPlayers}
          setActivePlayer={setActivePlayer}
          setWinner={setWinner}
          setGameState={setGameState}
        />
      </div>
    </main>
  );
}
