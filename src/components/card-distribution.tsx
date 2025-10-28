"use client";

import type { CardCount } from "@/lib/game";

interface CardDistributionProps {
  distribution: CardCount[];
}

export function CardDistribution({ distribution }: CardDistributionProps) {
  return (
    <div className="flex flex-col gap-2 p-2 bg-card rounded-lg border">
      {distribution.map((count) => (
        <div
          key={count.rank}
          className="flex items-center justify-between gap-2 px-2 py-1 rounded bg-muted text-sm"
          title={`${count.active} active out of ${count.total} total`}
        >
          <span className="font-bold min-w-[1.5rem]">{count.rank}</span>
          <span className="text-muted-foreground tabular-nums">
            {count.active}/{count.total}
          </span>
        </div>
      ))}
    </div>
  );
}