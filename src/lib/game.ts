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
  let acePositions: PlayerPosition[] = [];

  const createGridAndPlayers = () => {
    const newGrid: Grid = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => {
        const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
        const randomRank = ranks[Math.floor(Math.random() * ranks.length)];
        const card: Card = {
          suit: randomSuit,
          rank: randomRank,
          value: getRankValue(randomRank),
        };
        return { card, isInvalid: false };
      })
    );

    const newAcePositions: PlayerPosition[] = [];
    newGrid.forEach((row, r) =>
      row.forEach((cell, c) => {
        if (cell.card.rank === "A") {
          newAcePositions.push({ row: r, col: c });
        }
      })
    );
    
    // Shuffle ace positions to ensure random assignment
    for (let i = newAcePositions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newAcePositions[i], newAcePositions[j]] = [newAcePositions[j], newAcePositions[i]];
    }

    const newPlayers: Player[] = [];
    if (newAcePositions.length >= playerCount) {
      for (let i = 0; i < playerCount; i++) {
        const position = newAcePositions[i];
        newGrid[position.row][position.col].occupiedBy = i;
        newPlayers.push({ id: i, position, isFinished: false });
      }
    }
    
    return { newGrid, newPlayers, newAcePositions };
  };
  
  let attempt = createGridAndPlayers();
  
  while (attempt.newPlayers.length < playerCount) {
      attempt = createGridAndPlayers();
  }

  grid = attempt.newGrid;
  players = attempt.newPlayers;

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
          
          if (!grid[newRow][newCol].isInvalid) {
              moveSet.add(JSON.stringify({ row: newRow, col: newCol }));
          }
      }
  }

  return Array.from(moveSet).map((m) => JSON.parse(m));
};
