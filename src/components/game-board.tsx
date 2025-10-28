
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { generateGrid, getPossibleMoves, getCardDistribution } from "@/lib/game";
import { CardDistribution } from "./card-distribution";
import type { Grid, Player, PlayerPosition } from "@/lib/types";
import { PlayingCard } from "./playing-card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const CPU_MOVE_DELAY = 250;

interface GameBoardProps {
  gridSize: number;
  playerCount: number;
  cardSize: number;
  setPlayers: (players: Player[]) => void;
  setActivePlayer: (player: Player | null) => void;
  setWinner: (player: Player | null) => void;
  setGameState: (gameState: "loading" | "playing" | "gameOver") => void;
  cpuAutoPlay: boolean;
}

import { MoveHistory } from "./move-history";

interface Move {
  playerId: number;
  from: {
    value: number;
    suit: Suit;
  };
  to: {
    value: number;
    suit: Suit;
  };
}

export function GameBoard({ 
  gridSize, 
  playerCount, 
  cardSize,
  setPlayers: setPlayersProp,
  setActivePlayer: setActivePlayerProp,
  setWinner: setWinnerProp,
  setGameState: setGameStateProp,
  cpuAutoPlay,
}: GameBoardProps) {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [distribution, setDistribution] = useState<CardCount[]>([]);
  const [moveHistory, setMoveHistory] = useState<Move[]>([]);
  const [currentPlayerId, setCurrentPlayerId] = useState(0);
  const [possibleMoves, setPossibleMoves] = useState<PlayerPosition[]>([]);
  const [gameState, setGameState] = useState<"loading" | "playing" | "gameOver">("loading");
  const [justMovedTo, setJustMovedTo] = useState<PlayerPosition | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);
  const [usedValues, setUsedValues] = useState<Set<number>>(new Set());

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
    if (gameState !== "playing" || !activePlayer || activePlayer.isFinished || !grid) {
      console.log('Move rejected - invalid game state:', { 
        gameState, 
        activePlayer: activePlayer?.id,
        isFinished: activePlayer?.isFinished,
        hasGrid: !!grid
      });
      return;
    }
  
    // Use the already calculated possibleMoves
    const isPossible = possibleMoves.some(
      (move) => move.row === row && move.col === col
    );
    
    console.log('Executing move:', {
      player: activePlayer.id,
      type: activePlayer.type,
      from: activePlayer.position,
      to: { row, col },
      isPossible
    });
  
    if (isPossible) {
      const oldPos = activePlayer.position;
      console.log('Executing move from', oldPos, 'to', { row, col });
      
      // Record move in history
      const fromCell = grid[oldPos.row][oldPos.col];
      const toCell = grid[row][col];
      setMoveHistory(prev => [...prev, {
        playerId: activePlayer.id,
        from: {
          value: fromCell.card.value,
          suit: fromCell.card.suit
        },
        to: {
          value: toCell.card.value,
          suit: toCell.card.suit
        }
      }]);
      
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
        // record picked value globally
        const pickedValue = newGrid[row][col].card.value;
        setUsedValues(prev => {
          const next = new Set(prev);
          next.add(pickedValue);
          return next;
        });
        
        // Update distribution after invalidating a cell
        setDistribution(getCardDistribution(newGrid));
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
      const initUsed = new Set<number>();
      newPlayers.forEach((p) => {
        const v = newGrid[p.position.row][p.position.col].card.value;
        initUsed.add(v);
      });
      setUsedValues(initUsed);
      setDistribution(getCardDistribution(newGrid));
      setMoveHistory([]);
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
      console.log('No moves calculated:', { gameState, hasGrid: !!grid, player: activePlayer?.id, isFinished: activePlayer?.isFinished });
      setPossibleMoves([]);
      return;
    }

    let moves = getPossibleMoves(grid, activePlayer.position);
    // Disallow moving onto any card value that has already been picked globally
    moves = moves.filter(m => !usedValues.has(grid[m.row][m.col].card.value));
    
    console.log('Player state:', {
      playerId: activePlayer.id,
      type: activePlayer.type,
      position: activePlayer.position,
      possibleMoves: moves.length,
      moves: moves
    });

    if (activePlayer.type === 'cpu') {
        console.log('CPU turn starting, autoPlay:', cpuAutoPlay);
        
        if (moves.length === 0) {
            console.log('CPU has no moves, marking as finished');
            setPlayers(prev => prev.map(p => p.id === activePlayer.id ? { ...p, isFinished: true } : p));
            advanceTurn();
            return;
        }

        // Always show possible moves in manual mode
        setPossibleMoves(cpuAutoPlay ? [] : moves);

        if (cpuAutoPlay) {
          // Auto mode: CPU chooses and executes move
          const scored = moves.map(m => {
            const cell = grid[m.row][m.col];
            return { ...m, value: cell.card.value, card: cell.card };
          });
          const maxVal = Math.max(...scored.map(s => s.value));
          const best = scored.filter(s => s.value === maxVal);
          const choice = best[Math.floor(Math.random() * best.length)];

          console.log('CPU auto mode - choosing move:', {
            totalMoves: moves.length,
            possibleMoves: moves,
            selectedMove: choice
          });
          
          const timeoutId = setTimeout(() => {
              if (choice && grid) {
                  console.log('CPU executing move:', choice);
                  handleMove(choice.row, choice.col);
              }
          }, CPU_MOVE_DELAY);

          return () => clearTimeout(timeoutId);
        } else {
          // Manual mode: Show possible moves and wait for player to choose
          console.log('CPU manual mode - waiting for player choice');
        }
    } else { // Human player
        console.log('Human turn, setting possible moves');
        setPossibleMoves(moves);
        if (moves.length === 0) {
            console.log('Human has no moves, marking as finished');
            setPlayers(prev => prev.map(p => p.id === activePlayer.id ? { ...p, isFinished: true } : p));
            advanceTurn();
        }
    }
  }, [gameState, grid, activePlayer, advanceTurn, usedValues]);


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
      {grid && (
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <CardDistribution distribution={distribution} />
          <MoveHistory moves={moveHistory} />
        </div>
      )}
    </div>
  );
}

const playerColors = ['text-yellow-400', 'text-blue-400', 'text-green-400', 'text-red-400'];
