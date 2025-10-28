import type { Grid, Card, Suit, PlayerPosition, Player } from "./types";

const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

export interface CardCount {
  rank: string;
  total: number;
  active: number;
}

export const getRankValue = (rank: string): number => {
  if (rank === "A") return 1;
  return parseInt(rank, 10);
};

/**
 * Generates a versatile game grid that works with any size from 3 to 10.
 * For remaining cards needed after the main deck, uses progressively smaller
 * rank sets (A to n-1, then A to n-2, etc.) to maintain balance.
 */
export const generateVersatileGrid = (size: number): Grid => {
  // Validate size
  if (size < 3 || size > 10) {
    throw new Error("Grid size must be between 3 and 10");
  }

  const totalCardsNeeded = size * size;
  let gridDeck: Card[] = [];
  let currentMaxRank = size;

  // Keep adding cards from progressively smaller decks until we have enough
  while (gridDeck.length < totalCardsNeeded && currentMaxRank >= 1) {
    // Create ranks for this iteration (A to currentMaxRank)
    const ranks = ["A", ...Array.from(
      { length: currentMaxRank - 1 }, 
      (_, i) => (i + 2).toString()
    )];

    // Create deck with current rank set
    const currentDeck: Card[] = [];
    for (const suit of SUITS) {
      for (const rank of ranks) {
        currentDeck.push({
          suit,
          rank,
          value: getRankValue(rank)
        });
      }
    }

    // Shuffle current deck
    for (let i = currentDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
    }

    // Add all cards if we need more than this deck size,
    // or just the needed amount if this deck is enough
    const remainingNeeded = totalCardsNeeded - gridDeck.length;
    const cardsToAdd = Math.min(remainingNeeded, currentDeck.length);
    gridDeck = [...gridDeck, ...currentDeck.slice(0, cardsToAdd)];

    // Move to next smaller rank set
    currentMaxRank--;
  }

  // Final shuffle of the complete deck
  for (let i = gridDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [gridDeck[i], gridDeck[j]] = [gridDeck[j], gridDeck[i]];
  }

  // Create and populate the grid
  const grid: Grid = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      const cardIndex = row * size + col;
      return {
        card: gridDeck[cardIndex],
        isInvalid: false
      };
    })
  );

  return grid;
};

export const generateGrid = (
  size: number,
  playerCount: number
): { grid: Grid; players: Player[] } => {
  // Generate the grid using our versatile algorithm
  const grid = generateVersatileGrid(size);
  const players: Player[] = [];

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

  // Validate we have enough Aces for the players
  if (acePositions.length < playerCount) {
    throw new Error(`Not enough Aces for ${playerCount} players. Found ${acePositions.length} Aces.`);
  }

  // Create players at shuffled ace positions
  for (let i = 0; i < playerCount; i++) {
    const position = acePositions[i];
    grid[position.row][position.col].occupiedBy = i;
    players.push({ 
      id: i, 
      position, 
      isFinished: false, 
      type: i === 0 ? 'human' : 'cpu' 
    });
  }

  return { grid, players };
};

/**
 * Calculates the distribution of cards in the grid, showing total and active counts for each rank
 */
export const getCardDistribution = (grid: Grid): CardCount[] => {
  const distribution = new Map<string, CardCount>();
  
  // Initialize distribution with all ranks
  const size = grid.length;
  const ranks = ["A", ...Array.from({ length: size - 1 }, (_, i) => (i + 2).toString())];
  ranks.forEach(rank => {
    distribution.set(rank, { rank, total: 0, active: 0 });
  });

  // Count cards in grid
  grid.forEach(row => {
    row.forEach(cell => {
      const rank = cell.card.rank;
      const count = distribution.get(rank)!;
      count.total++;
      if (!cell.isInvalid) {
        count.active++;
      }
    });
  });

  // Convert to sorted array
  return Array.from(distribution.values())
    .sort((a, b) => {
      if (a.rank === "A") return -1;
      if (b.rank === "A") return 1;
      return parseInt(a.rank) - parseInt(b.rank);
    });
};

interface PathNode {
  row: number;
  col: number;
  movesLeft: number;
}

export const getPossibleMoves = (
  grid: Grid,
  position: PlayerPosition
): PlayerPosition[] => {
  const { row, col } = position;
  if (!grid[row] || !grid[row][col]) return [];
  
  const currentCell = grid[row][col];
  if(currentCell.isInvalid) return [];

  const maxMoves = currentCell.card.value;
  const size = grid.length;
  const moveSet = new Set<string>();

  // Directions: Right, Left, Down, Up
  const directions = [
    { dr: 0, dc: 1 },
    { dr: 0, dc: -1 },
    { dr: 1, dc: 0 },
    { dr: -1, dc: 0 }
  ];

  // Breadth-first search to find all reachable positions within moves limit
  const queue: PathNode[] = [{ row, col, movesLeft: maxMoves }];
  const visited = new Set<string>(); // Track visited positions with remaining moves
  visited.add(`${row},${col},${maxMoves}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // For each direction
    for (const { dr, dc } of directions) {
      if (current.movesLeft <= 0) continue;

      // Calculate next position with wrapping
      const newRow = (current.row + dr + size) % size;
      const newCol = (current.col + dc + size) % size;
      const nextCell = grid[newRow][newCol];

          // Skip if:
      // 1. Cell is invalid
      // 2. Cell is occupied by another player
      if (nextCell.isInvalid || nextCell.occupiedBy !== undefined) continue;

      // Special case: If it's an unoccupied active 'A' card, it's always a valid move
      // regardless of remaining moves
      if (nextCell.card.rank === 'A' && (newRow !== row || newCol !== col)) {
        moveSet.add(JSON.stringify({ row: newRow, col: newCol }));
        continue; // Don't need to explore further from this 'A' card
      }

      // Normal movement rules
      const movesLeftAfterStep = current.movesLeft - 1;
      const visitKey = `${newRow},${newCol},${movesLeftAfterStep}`;

      if (!visited.has(visitKey)) {
        visited.add(visitKey);
        queue.push({
          row: newRow,
          col: newCol,
          movesLeft: movesLeftAfterStep
        });

        // Add to possible moves if it's a different position from start
        if (newRow !== row || newCol !== col) {
          moveSet.add(JSON.stringify({ row: newRow, col: newCol }));
        }
      }
    }
  }

  return Array.from(moveSet).map((m) => JSON.parse(m));
};
