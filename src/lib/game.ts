import type { Grid, Card, Suit, PlayerPosition } from "./types";

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

export const getRankValue = (rank: string): number => {
  if (rank === "A") return 1;
  return parseInt(rank, 10);
};

export const generateGrid = (
  size: number
): { grid: Grid; playerPosition: PlayerPosition } => {
  const ranks = ["A", ...Array.from({ length: size - 1 }, (_, i) => (i + 2).toString())];
  let grid: Grid = [];
  let acePositions: PlayerPosition[] = [];

  // This function generates a grid and ensures at least one 'A' card is present.
  const createGridAttempt = () => {
    const newGrid: Grid = [];
    const newAcePositions: PlayerPosition[] = [];
    for (let i = 0; i < size; i++) {
      newGrid[i] = [];
      for (let j = 0; j < size; j++) {
        const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
        const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
        const card: Card = {
          suit: randomSuit,
          rank: randomRank,
          value: getRankValue(randomRank),
        };
        newGrid[i][j] = { card, isInvalid: false };
        if (card.rank === "A") {
          newAcePositions.push({ row: i, col: j });
        }
      }
    }
    return { newGrid, newAcePositions };
  };

  let attempt = createGridAttempt();
  grid = attempt.newGrid;
  acePositions = attempt.newAcePositions;

  // In the unlikely event no 'A' is generated, retry.
  while (acePositions.length === 0) {
    attempt = createGridAttempt();
    grid = attempt.newGrid;
    acePositions = attempt.newAcePositions;
  }

  const playerPosition =
    acePositions[Math.floor(Math.random() * acePositions.length)];

  return { grid, playerPosition };
};

export const getPossibleMoves = (
  grid: Grid,
  position: PlayerPosition
): PlayerPosition[] => {
  const { row, col } = position;
  if (!grid[row] || !grid[row][col]) return [];

  const maxDist = grid[row][col].card.value;
  const size = grid.length;
  const moveSet = new Set<string>();

  for (let dist = 1; dist <= maxDist; dist++) {
    const targets: PlayerPosition[] = [
      { row: row, col: (col + dist + size * dist) % size }, // Right
      { row: row, col: (col - dist + size * dist) % size }, // Left
      { row: (row + dist + size * dist) % size, col: col }, // Down
      { row: (row - dist + size * dist) % size, col: col }, // Up
    ];

    for (const target of targets) {
      if (!grid[target.row][target.col].isInvalid) {
        moveSet.add(JSON.stringify(target));
      }
    }
  }

  return Array.from(moveSet).map((m) => JSON.parse(m));
};
