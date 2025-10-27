"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { generateGrid, getPossibleMoves } from "@/lib/game";
import type { Grid, PlayerPosition } from "@/lib/types";
import { PlayingCard } from "./playing-card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_GRID_SIZE = 5;

export function GameBoard() {
  const [gridSize, setGridSize] = useState(DEFAULT_GRID_SIZE);
  const [grid, setGrid] = useState<Grid | null>(null);
  const [playerPos, setPlayerPos] = useState<PlayerPosition | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<PlayerPosition[]>([]);
  const [gameState, setGameState] = useState<"loading" | "playing" | "gameOver">("loading");
  const [justMovedTo, setJustMovedTo] = useState<PlayerPosition | null>(null);

  const { toast } = useToast();

  const startNewGame = useCallback((size: number) => {
    setGameState("loading");
    try {
      const { grid: newGrid, playerPosition: newPlayerPos } = generateGrid(size);
      setGrid(newGrid);
      setPlayerPos(newPlayerPos);
      setJustMovedTo(null);
      setGameState("playing");
      toast({
        title: "New Game Started",
        description: `A new ${size}x${size} grid has been generated. Good luck!`,
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

  useEffect(() => {
    startNewGame(gridSize);
  }, []);

  useEffect(() => {
    if (grid && playerPos && gameState === 'playing') {
      const moves = getPossibleMoves(grid, playerPos);
      setPossibleMoves(moves);
      if (moves.length === 0) {
        setGameState("gameOver");
      }
    }
  }, [grid, playerPos, gameState]);

  const handleMove = (row: number, col: number) => {
    if (gameState !== "playing" || !playerPos) return;

    const isPossible = possibleMoves.some(
      (move) => move.row === row && move.col === col
    );

    if (isPossible) {
      const newGrid = grid!.map((r, rIndex) =>
        r.map((c, cIndex) => {
          if (rIndex === playerPos.row && cIndex === playerPos.col) {
            return { ...c, isInvalid: true };
          }
          return c;
        })
      );
      setGrid(newGrid);
      setPlayerPos({ row, col });
      setJustMovedTo({ row, col });
      setTimeout(() => setJustMovedTo(null), 500); // Reset pulse animation
    }
  };
  
  const gridStyle = useMemo(() => ({
      gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
  }), [gridSize]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="relative grid w-full gap-2 sm:gap-4"
        style={gridStyle}
      >
        <AnimatePresence>
          {gameState === 'gameOver' && (
             <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-sm"
            >
              <div className="transform-gpu rounded-lg bg-card p-6 text-center shadow-xl ring-1 ring-border">
                <h2 className="font-headline text-3xl font-bold text-primary">
                  You Win!
                </h2>
                <p className="mt-2 text-card-foreground">
                  You've made the last possible move.
                </p>
                <Button onClick={() => startNewGame(gridSize)} className="mt-4">
                  Play Again
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {grid &&
          playerPos &&
          grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isKingHere =
                playerPos.row === rowIndex && playerPos.col === colIndex;
              const isPossible = possibleMoves.some(
                (move) => move.row === rowIndex && move.col === colIndex
              );
              const movedTo = justMovedTo?.row === rowIndex && justMovedTo?.col === colIndex;

              return (
                <PlayingCard
                  key={`${rowIndex}-${colIndex}`}
                  card={cell.card}
                  isInvalid={cell.isInvalid}
                  isKingHere={isKingHere}
                  isPossibleMove={isPossible}
                  justMovedTo={movedTo}
                  onClick={() => handleMove(rowIndex, colIndex)}
                />
              );
            })
          )}
      </div>

      <div className="mt-4 flex w-full flex-col items-center gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:justify-between">
        <div className="flex w-full items-center gap-4 sm:w-auto">
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
            className="w-full sm:w-48"
          />
        </div>
        <Button onClick={() => startNewGame(gridSize)} className="w-full sm:w-auto">
          New Game
        </Button>
      </div>
    </div>
  );
}
