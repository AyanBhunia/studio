
"use client";

import { useState, useCallback, useEffect } from "react";
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
  const [cpuThought, setCpuThought] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");


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
        cpuThought={cpuThought}
        debugInfo={debugInfo}
      />
      <div 
        className="flex flex-1 items-center justify-center p-4 overflow-auto bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1564191690443-a6a9b417300a?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')" }}
      >
        <GameBoard
          key={gameId}
          gridSize={gridSize}
          playerCount={playerCount}
          cardSize={cardSize}
          setPlayers={setPlayers}
          setActivePlayer={setActivePlayer}
          setWinner={setWinner}
          setGameState={setGameState}
          setCpuThought={setCpuThought}
          setDebugInfo={setDebugInfo}
        />
      </div>
    </main>
  );
}
