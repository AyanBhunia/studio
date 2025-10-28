
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { generateGrid, getPossibleMoves } from "@/lib/game";
import type { Grid, Player, PlayerPosition } from "@/lib/types";
import { PlayingCard } from "./playing-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const CPU_MOVE_DELAY = 1000;

interface GameBoardProps {
  gridSize: number;
  playerCount: number;
  cardSize: number;
  setPlayers: (players: Player[]) => void;
  setActivePlayer: (player: Player | null) => void;
  setWinner: (player: Player | null) => void;
  setGameState: (gameState: "loading" | "playing" | "gameOver") => void;
}

export function GameBoard({ 
  gridSize, 
  playerCount, 
  cardSize,
  setPlayers: setPlayersProp,
  setActivePlayer: setActivePlayerProp,
  setWinner: setWinnerProp,
  setGameState: setGameStateProp,
}: GameBoardProps) {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(0);
  const [possibleMoves, setPossibleMoves] = useState<PlayerPosition[]>([]);
  const [gameState, setGameState] = useState<"loading" | "playing" | "gameOver">("loading");
  const [justMovedTo, setJustMovedTo] = useState<PlayerPosition | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    setPlayersProp(players);
  }, [players, setPlayersProp]);

  useEffect(() => {
    setWinnerProp(winner);
  }, [winner, setWinnerProp]);

  useEffect(() => {
    setGameStateProp(gameState);
  }, [gameState, setGameStateProp]);

  const activePlayer = useMemo(() => {
    return players.find((p) => p.id === currentPlayerId);
  }, [players, currentPlayerId]);

  useEffect(() => {
    setActivePlayerProp(activePlayer || null);
  }, [activePlayer, setActivePlayerProp]);


  const advanceTurn = useCallback(() => {
    setPlayers(currentPlayers => {
        const activePlayers = currentPlayers.filter(p => !p.isFinished);
        if (activePlayers.length <= 1) {
            const winnerPlayer = activePlayers[0] || currentPlayers.find(p => p.id === currentPlayerId) || null;
            setWinner(winnerPlayer);
            setGameState("gameOver");
            return currentPlayers;
        }

        const currentPlayerIndexInAll = currentPlayers.findIndex(p => p.id === currentPlayerId);
        let nextPlayerIndex = (currentPlayerIndexInAll + 1);
        while (currentPlayers[nextPlayerIndex % currentPlayers.length]?.isFinished) {
            nextPlayerIndex++;
        }
        
        const nextPlayer = currentPlayers[nextPlayerIndex % currentPlayers.length];
        if (nextPlayer) {
            setCurrentPlayerId(nextPlayer.id);
        }
        return currentPlayers;
    });
}, [currentPlayerId]);


  const handleMove = useCallback((row: number, col: number) => {
    if (gameState !== "playing" || !activePlayer || activePlayer.isFinished) return;
  
    const isPossible = possibleMoves.some(
      (move) => move.row === row && move.col === col
    );
  
    if (isPossible) {
      const oldPos = activePlayer.position;
      
      setPlayers(prevPlayers => 
        prevPlayers.map(p => 
          p.id === activePlayer.id ? { ...p, position: { row, col } } : p
        )
      );
  
      setGrid(prevGrid => {
        if (!prevGrid) return null;
        const newGrid = prevGrid.map((r) => r.map((c) => ({ ...c })));
        newGrid[oldPos.row][oldPos.col].isInvalid = true;
        delete newGrid[oldPos.row][oldPos.col].occupiedBy;
        newGrid[row][col].occupiedBy = activePlayer.id;
        return newGrid;
      });

      setJustMovedTo({ row, col });
      setTimeout(() => setJustMovedTo(null), 500);
      
      advanceTurn();
    }
  }, [gameState, activePlayer, possibleMoves, advanceTurn]);

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
    } catch (error) {
      console.error("Failed to start new game:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not start a new game. Please try again.",
      });
    }
  }, [toast]);

  useEffect(() => {
    startNewGame(gridSize, playerCount);
  }, [gridSize, playerCount, startNewGame]);

  // Effect for handling player logic (calculating moves, checking for finished players)
  useEffect(() => {
    if (gameState !== 'playing' || !grid || !activePlayer || activePlayer.isFinished) {
      setPossibleMoves([]);
      return;
    }

    const moves = getPossibleMoves(grid, activePlayer.position);

    if (activePlayer.type === 'cpu') {
        setPossibleMoves([]); 
        if (moves.length === 0) {
            setPlayers(prev => prev.map(p => p.id === activePlayer.id ? { ...p, isFinished: true } : p));
            advanceTurn();
            return;
        }

        const timeoutId = setTimeout(() => {
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            if (randomMove) {
                // Re-calculate possible moves for handleMove
                setPossibleMoves(moves);
                handleMove(randomMove.row, randomMove.col);
            }
        }, CPU_MOVE_DELAY);

        return () => clearTimeout(timeoutId);
    } else { // Human player
        setPossibleMoves(moves);
        if (moves.length === 0) {
            setPlayers(prev => prev.map(p => p.id === activePlayer.id ? { ...p, isFinished: true } : p));
            advanceTurn();
        }
    }
  }, [gameState, grid, activePlayer, advanceTurn, handleMove]);


  const gridStyle = useMemo(() => ({
      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
      gap: '0.5rem',
  }), [gridSize]);

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="flex-1 w-full flex items-center justify-center p-2 min-h-0">
        <div
            className="relative grid aspect-[5/7] w-full"
            style={{
                ...gridStyle,
                maxWidth: `calc((${cardSize} / 100) * (80vh * (5/7)))`,
                maxHeight: `calc((${cardSize} / 100) * 80vh)`
            }}
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
                    {winner.type === 'human' ? `Player 1 Wins!` : `CPU ${winner.id + 1} Wins!`}
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
      </div>
    </div>
  );
}

const playerColors = ['text-yellow-400', 'text-blue-400', 'text-green-400', 'text-red-400'];
