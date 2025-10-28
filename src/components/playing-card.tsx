
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
  hearts: { icon: HeartIcon, color: "text-[#F7DAE5]" },
  diamonds: { icon: DiamondIcon, color: "text-[#C3E2E6]" },
  clubs: { icon: ClubIcon, color: "text-[#B3DDC4]" },
  spades: { icon: SpadeIcon, color: "text-[#D0CCE0]" },
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
       <div className="absolute left-0.5 top-0.5 p-0.5 text-left font-bold sm:left-1 sm:top-1 text-base sm:text-lg md:text-xl">
        {card.rank}
      </div>
      <div className="absolute bottom-0.5 right-0.5 rotate-180 p-0.5 text-left font-bold sm:bottom-1 sm:right-1 text-base sm:text-lg md:text-xl">
        {card.rank}
      </div>

      <div className="flex h-full w-full items-center justify-center">
        <SuitIcon
          className={cn(
            "h-8 w-8 opacity-50 sm:h-12 sm:w-12",
            isKingHere && "opacity-10"
          )}
        />
      </div>

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
