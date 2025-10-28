
"use client";

import type { Card, Suit } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ClubIcon, DiamondIcon, HeartIcon, SpadeIcon } from "./icons";
import { Crown, Bot } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { motion } from "framer-motion";

interface PlayingCardProps {
  card: Card;
  isInvalid: boolean;
  isKingHere: boolean;
  kingColor?: string;
  isPossibleMove: boolean;
  onClick: () => void;
  justMovedTo: boolean;
  isCurrentPlayerTurn: boolean;
  playerType?: 'human' | 'cpu';
}

const suitConfig: Record<Suit, { icon: React.ComponentType<{ className?: string }>, color: string }> = {
  hearts: { icon: HeartIcon, color: "text-[#D96F95]" },
  diamonds: { icon: DiamondIcon, color: "text-[#5DA0A8]" },
  clubs: { icon: ClubIcon, color: "text-[#58A87B]" },
  spades: { icon: SpadeIcon, color: "text-[#8E82B3]" },
};


export function PlayingCard({
  card,
  isInvalid,
  isKingHere,
  kingColor = 'text-yellow-400',
  isPossibleMove,
  onClick,
  justMovedTo,
  isCurrentPlayerTurn,
  playerType,
}: PlayingCardProps) {
  const cardBack = PlaceHolderImages.find((img) => img.id === "card-back");
  const { icon: SuitIcon, color: suitColor } = suitConfig[card.suit];
  
  if (isInvalid) {
    return (
      <div className="aspect-[5/7] w-full overflow-hidden rounded-md border-2 border-dashed border-muted-foreground/50 bg-muted/20">
        {cardBack && (
          <Image
            src={cardBack.imageUrl}
            alt={cardBack.description}
            data-ai-hint={cardBack.imageHint}
            width={200}
            height={280}
            className="h-full w-full object-cover opacity-50"
          />
        )}
      </div>
    );
  }

  return (
    <motion.button
      onClick={onClick}
      disabled={!isPossibleMove}
      className={cn(
        "relative aspect-[5/7] w-full overflow-hidden rounded-md border-2 bg-card text-foreground shadow-md transition-all duration-300",
        suitColor,
        isPossibleMove
          ? "cursor-pointer ring-4 ring-accent ring-offset-2 ring-offset-background hover:scale-105 hover:shadow-lg"
          : "cursor-default",
        isKingHere ? "shadow-2xl" : "",
        justMovedTo ? "animate-pulse" : "",
        isCurrentPlayerTurn && "ring-4 ring-offset-2 ring-offset-background",
        isCurrentPlayerTurn && isPossibleMove ? "ring-accent" : isCurrentPlayerTurn ? "ring-primary/50" : ""
      )}
      aria-label={`Card ${card.rank} of ${card.suit}. ${isPossibleMove ? "Possible move." : ""}`}
    >
      <div className="flex h-full w-full items-center justify-center p-1">
        <span className="text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
            {card.rank}
        </span>
      </div>

      <SuitIcon className="absolute left-1 top-1 h-4 w-4 sm:h-5 sm:w-5" />
      <SuitIcon className="absolute bottom-1 right-1 h-4 w-4 rotate-180 sm:h-5 sm:w-5" />

      {isKingHere && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          {playerType === 'cpu' ? (
            <Bot className={cn("h-1/2 w-1/2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]", kingColor)} />
          ) : (
            <Crown className={cn("h-1/2 w-1/2 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]", kingColor)} />
          )}
        </div>
      )}
    </motion.button>
  );
}
