
"use client";

import { cn } from "@/lib/utils";
import type { Player } from "@/lib/types";
import { Crown, Bot, Users } from "lucide-react";

interface GameInfoProps {
  players: Player[];
  activePlayer: Player | null;
  winner: Player | null;
  gameState: "loading" | "playing" | "gameOver";
}

const playerColors = ['text-yellow-400', 'text-blue-400', 'text-green-400', 'text-red-400'];

export function GameInfo({ players, activePlayer, gameState, winner }: GameInfoProps) {
  if (gameState === "loading") {
    return <div className="text-center">Loading...</div>;
  }
  
  return (
    <div className="w-full flex justify-around items-center flex-wrap gap-2 md:gap-4 mb-2 px-4">
      {players.map(player => (
        <div key={player.id} className={cn(
            "flex items-center gap-2 p-2 rounded-lg transition-all",
            player.id === activePlayer?.id && !player.isFinished && gameState === 'playing' && "bg-primary/10 ring-2 ring-primary"
        )}>
          {player.type === 'human' ? (
              <Crown className={cn(playerColors[player.id % playerColors.length], player.isFinished && "opacity-30")} />
          ) : (
              <Bot className={cn(playerColors[player.id % playerColors.length], player.isFinished && "opacity-30")} />
          )}
          <span className={cn("font-bold", player.isFinished && "line-through text-muted-foreground")}>
            {player.type === 'human' ? 'Player 1' : `CPU ${player.id + 1}`}
          </span>
        </div>
      ))}
    </div>
  );
}
