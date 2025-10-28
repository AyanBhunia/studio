
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GameInfo } from "./game-info";
import type { Player } from "@/lib/types";

interface GameControlsProps {
  gridSize: number;
  setGridSize: (value: number) => void;
  playerCount: number;
  setPlayerCount: (value: number) => void;
  cardSize: number;
  setCardSize: (value: number) => void;
  onNewGame: () => void;
  players: Player[];
  activePlayer: Player | null;
  winner: Player | null;
  gameState: "loading" | "playing" | "gameOver";
}

export function GameControls({
  gridSize,
  setGridSize,
  playerCount,
  setPlayerCount,
  cardSize,
  setCardSize,
  onNewGame,
  players,
  activePlayer,
  winner,
  gameState
}: GameControlsProps) {
  return (
    <Card className="flex w-full md:max-w-sm flex-col rounded-none border-0 md:border-r md:shadow-lg">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl tracking-wider text-primary sm:text-4xl">
          Royal Grid Domination
        </CardTitle>
        <CardDescription className="font-body text-base">
          The last king standing wins the grid. Plan your moves wisely.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col justify-between gap-8 p-4">
        <GameInfo players={players} activePlayer={activePlayer} winner={winner} gameState={gameState} />

        <div className="flex flex-col gap-4 rounded-lg border bg-card p-4">
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
              Players
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
          <div className="flex flex-grow items-center gap-4">
            <Label htmlFor="card-size-slider" className="whitespace-nowrap font-bold">
              Card Size: {cardSize}%
            </Label>
            <Slider
              id="card-size-slider"
              min={20}
              max={100}
              step={5}
              value={[cardSize]}
              onValueChange={(value) => setCardSize(value[0])}
              className="w-full sm:w-32"
            />
          </div>
          <Button onClick={onNewGame} className="w-full">
            New Game
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
