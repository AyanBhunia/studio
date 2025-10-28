import type { Grid, Card, Suit, PlayerPosition, Player } from "./types";

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

export const getRankValue = (rank: string): number => {
  if (rank === "A") return 1;
  return parseInt(rank, 10);
};

export const generateGrid = (
  size: number,
  playerCount: number
): { grid: Grid; players: Player[] } => {
  const ranks = ["A", ...Array.from({ length: size - 1 }, (_, i) => (i + 2).toString())];
  let grid: Grid;
  let players: Player[] = [];

  // Create all possible card combinations
  const allCards: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of ranks) {
      // We need exactly size copies of each rank and suit
      const copies = size / SUITS.length; // For size 4, this means 1 copy of each rank per suit
      for (let i = 0; i < copies; i++) {
        allCards.push({
          suit,
          rank,
          value: getRankValue(rank)
        });
      }
    }
  }

  // Fisher-Yates shuffle the cards
  for (let i = allCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCards[i], allCards[j]] = [allCards[j], allCards[i]];
  }

  // Create grid and fill with shuffled cards
  grid = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      const cardIndex = row * size + col;
      const card = allCards[cardIndex];
      return { card, isInvalid: false };
    })
  );

  // Find all Ace positions
  const acePositions: PlayerPosition[] = [];
  grid.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell.card.rank === "A") {
        acePositions.push({ row: r, col: c });
      }
    })
  );

  // Shuffle ace positions for random player placement
  for (let i = acePositions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [acePositions[i], acePositions[j]] = [acePositions[j], acePositions[i]];
  }

  // Create players at shuffled ace positions
  if (acePositions.length >= playerCount) {
    for (let i = 0; i < playerCount; i++) {
      const position = acePositions[i];
      grid[position.row][position.col].occupiedBy = i;
      players.push({ id: i, position, isFinished: false, type: i === 0 ? 'human' : 'cpu' });
    }
  } else {
    // This case shouldn't happen with our new card distribution logic
    throw new Error("Not enough Aces for player count");
  }

  return { grid, players };
};

export const getPossibleMoves = (
  grid: Grid,
  position: PlayerPosition
): PlayerPosition[] => {
  const { row, col } = position;
  if (!grid[row] || !grid[row][col]) return [];
  
  const currentCell = grid[row][col];
  if(currentCell.isInvalid) return [];

  const maxDist = currentCell.card.value;
  const size = grid.length;
  const moveSet = new Set<string>();

  const directions = [
    { dr: 0, dc: 1 }, // Right
    { dr: 0, dc: -1 }, // Left
    { dr: 1, dc: 0 }, // Down
    { dr: -1, dc: 0 }, // Up
  ];

  for (const {dr, dc} of directions) {
      for (let dist = 1; dist <= maxDist; dist++) {
          const newRow = (row + dr * dist + size) % size;
          const newCol = (col + dc * dist + size) % size;
          
          if (!grid[newRow][newCol].isInvalid && grid[newRow][newCol].occupiedBy === undefined) {
              moveSet.add(JSON.stringify({ row: newRow, col: newCol }));
          }
      }
  }

  return Array.from(moveSet).map((m) => JSON.parse(m));
};
