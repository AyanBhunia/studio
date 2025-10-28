"use client";

import { Card } from "@/components/ui/card";
import type { Suit } from "@/lib/types";

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

interface MoveHistoryProps {
  moves: Move[];
}

const suitSymbols: Record<Suit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠"
};

export function MoveHistory({ moves }: MoveHistoryProps) {
  return (
    <div className="w-36 bg-card rounded-lg border p-2">
      <div className="font-bold text-sm mb-2">Move History</div>
      <div className="space-y-1 max-h-[200px] overflow-y-auto text-sm font-mono">
        {moves.map((move, index) => (
          <div key={index} className="flex items-center gap-1 text-muted-foreground">
            <span className="text-foreground font-bold min-w-[2ch]">
              {index + 1}.
            </span>
            <span>
              {move.from.value}
              {suitSymbols[move.from.suit]}→
              {move.to.value}
              {suitSymbols[move.to.suit]}
              P{move.playerId + 1}
            </span>
          </div>
        ))}
        {moves.length === 0 && (
          <div className="text-muted-foreground text-center italic">
            No moves yet
          </div>
        )}
      </div>
    </div>
  );
}