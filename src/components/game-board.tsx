"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { generateGrid, getPossibleMoves } from "@/lib/game";
import type { Grid, Player, PlayerPosition } from "@/lib/types";
import { PlayingCard } from "./playing-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Users, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const DEFAULT_GRID_SIZE = 5;
const DEFAULT_PLAYER_COUNT = 2; // Default to 1 CPU player
const CPU_MOVE_DELAY = 1000; // 1 second delay for CPU move

export function GameBoard() {
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [playerCount, setPlayerCount] = useState(DEFAULT_PLAYER_COUNT);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(0);
  const [possibleMoves, setPossibleMoves] = useState<PlayerPosition[]>([]);
  const [gameState, setGameState] = useState<"loading" | "playing" | "gameOver">("loading");
  const [justMovedTo, setJustMovedTo] = useState<PlayerPosition | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  const { toast } = useToast();

  const activePlayer = useMemo(() => {
    return players.find((p) => p.id === currentPlayerId);
  }, [players, currentPlayerId]);

  const startNewGame = useCallback((size: number, numPlayers: number) => {
    setGameState("loading");
    if (numPlayers < 1) {
      toast({
        variant: "destructive",
        title: "Invalid Player Count",
        description: "Number of players must be at least 1.",
      });
      setGameState("playing");
      return;
    }
    try {
      const { grid: newGrid, players: newPlayers } = generateGrid(size, numPlayers);
      setGrid(newGrid);
      setPlayers(newPlayers);
      setCurrentPlayerId(0);
      setPossibleMoves([]);
      setJustMovedTo(null);
      setWinner(null);
      setGameState("playing");
      toast({
        title: "New Game Started",
        description: `A new ${size}x${size} grid with ${numPlayers} player(s) has been generated. Good luck!`,
      });
    } catch (error) {
      console.error("Failed to start new game:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new game. Please try again.",
      });
    }
  }, [toast]);

  const advanceTurn = useCallback(() => {
    const activePlayers = players.filter(p => !p.isFinished);
    if (activePlayers.length <= 1) {
      setWinner(activePlayers[0] || players.find(p => p.id === currentPlayerId) || null);
      setGameState("gameOver");
      return;
    }

    const currentPlayerIndex = players.findIndex(p => p.id === currentPlayerId);
    let nextPlayerIndex = (currentPlayerIndex + 1) % players.length;
    while (players[nextPlayerIndex]?.isFinished) {
      nextPlayerIndex = (nextPlayerIndex + 1) % players.length;
    }
    if (players[nextPlayerIndex]) {
      setCurrentPlayerId(players[nextPlayerIndex].id);
    }
  }, [players, currentPlayerId]);

  const handleMove = useCallback((row: number, col: number) => {
    if (gameState !== "playing" || !activePlayer || activePlayer.isFinished) return;
  
    const isPossible = possibleMoves.some(
      (move) => move.row === row && move.col === col
    );
  
    if (isPossible) {
      setPlayers(prevPlayers => {
        const newPlayers = prevPlayers.map(p => 
          p.id === activePlayer.id ? { ...p, position: { row, col } } : p
        );
  
        setGrid(prevGrid => {
          if (!prevGrid) return null;
          const newGrid = prevGrid.map((r) => r.map((c) => ({ ...c })));
          const oldPos = activePlayer.position;
          newGrid[oldPos.row][oldPos.col].isInvalid = true;
          delete newGrid[oldPos.row][oldPos.col].occupiedBy;
          newGrid[row][col].occupiedBy = activePlayer.id;
          return newGrid;
        });
  
        setJustMovedTo({ row, col });
        setTimeout(() => setJustMovedTo(null), 500); // Reset pulse animation
        
        advanceTurn();
        return newPlayers;
      });
    }
  }, [gameState, activePlayer, possibleMoves, advanceTurn]);

  // Initial game setup
  useEffect(() => {
    startNewGame(gridSize, playerCount);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Game logic for the current player's turn
  useEffect(() => {
    if (gameState !== 'playing' || !grid || !activePlayer) {
      return;
    }

    const moves = getPossibleMoves(grid, activePlayer.position);
    setPossibleMoves(moves);

    if (moves.length === 0 && !activePlayer.isFinished) {
      setPlayers(prev => prev.map(p => p.id === activePlayer.id ? { ...p, isFinished: true } : p));
      advanceTurn();
      return;
    }

    if (activePlayer.type === 'cpu') {
      const timeoutId = setTimeout(() => {
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        if (randomMove) {
          handleMove(randomMove.row, randomMove.col);
        }
      }, CPU_MOVE_DELAY);

      return () => clearTimeout(timeoutId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, grid, activePlayer]);


  const gridStyle = useMemo(() => ({
      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
  }), [gridSize]);

  const playerColors = ['text-yellow-400', 'text-blue-400', 'text-green-400', 'text-red-400'];

  return (
    <div className="flex w-full flex-col items-center justify-center gap-4 p-2 md:p-4">
       <div className="w-full flex justify-around items-center flex-wrap gap-2 md:gap-4 mb-2">
        {players.map(player => (
          <div key={player.id} className={cn(
              "flex items-center gap-2 p-2 rounded-lg transition-all",
              player.id === currentPlayerId && !player.isFinished && "bg-primary/10 ring-2 ring-primary"
          )}>
            {player.type === 'human' ? (
                <Crown className={cn(playerColors[player.id % playerColors.length], player.isFinished && "opacity-30")} />
            ) : (
                <Bot className={cn(playerColors[player.id % playerColors.length], player.isFinished && "opacity-30")} />
            )}
            <span className={cn("font-bold", player.isFinished && "line-through text-muted-foreground")}>
              {player.type === 'human' ? 'Player 1' : `CPU ${player.id}`}
            </span>
          </div>
        ))}
      </div>
      <div
        className="relative grid w-full max-w-2xl gap-1 sm:gap-2"
        style={gridStyle}
      >
        <AnimatePresence>
          {gameState === 'gameOver' && winner && (
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm"
            >
              <div className="transform-gpu rounded-lg bg-card p-6 text-center shadow-xl ring-1 ring-border">
                <h2 className="font-headline text-3xl font-bold text-primary">
                  {winner.type === 'human' ? `Player ${winner.id + 1} Wins!` : `CPU ${winner.id} Wins!`}
                </h2>
                <p className="mt-2 text-card-foreground">
                  Congratulations on being the last king standing.
                </p>
                <Button onClick={() => startNewGame(gridSize, playerCount)} className="mt-4">
                  Play Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {grid &&
          grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const kingPlayer = players.find(p => p.position.row === rowIndex && p.position.col === colIndex);
              const isKingHere = !!kingPlayer;

              const isPossible = possibleMoves.some(
                (move) => move.row === rowIndex && move.col === colIndex
              );
              const movedTo = justMovedTo?.row === rowIndex && justMovedTo?.col === colIndex;

              const isHumanPlayerTurn = activePlayer?.type === 'human';

              return (
                <PlayingCard
                  key={`${rowIndex}-${colIndex}`}
                  card={cell.card}
                  isInvalid={cell.isInvalid}
                  isKingHere={isKingHere}
                  kingColor={isKingHere ? playerColors[kingPlayer.id % playerColors.length] : undefined}
                  isPossibleMove={isPossible && isHumanPlayerTurn}
                  justMovedTo={movedTo}
                  onClick={() => isHumanPlayerTurn && handleMove(rowIndex, colIndex)}
                  isCurrentPlayerTurn={isKingHere && kingPlayer.id === currentPlayerId}
                  playerType={kingPlayer?.type}
                />
              );
            })
          )}
      </div>

      <div className="flex w-full max-w-2xl flex-col items-stretch gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:flex-wrap sm:justify-between">
        <div className="flex flex-grow items-center gap-4">
          <Label htmlFor="grid-size-slider" className="whitespace-nowrap font-bold">
            Grid Size: {gridSize}x{gridSize}
          </Label>
          <Slider
            id="grid-size-slider"
            min={4}
            max={8}
            step={1}
            value={[gridSize]}
            onValueChange={(value) => setGridSize(value[0])}
            className="w-full sm:w-32"
          />
        </div>
        <div className="flex items-center gap-4">
          <Label htmlFor="player-count" className="whitespace-nowrap font-bold flex items-center gap-2">
            <Users /> Players
          </Label>
          <Input
            id="player-count"
            type="number"
            min={1}
            max={4}
            value={playerCount}
            onChange={(e) => setPlayerCount(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-20"
          />
        </div>
        <Button onClick={() => startNewGame(gridSize, playerCount)} className="w-full sm:w-auto flex-grow sm:flex-grow-0">
          New Game
        </Button>
      </div>
    </div>
  );
}
