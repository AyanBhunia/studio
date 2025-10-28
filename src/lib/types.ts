export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export interface Card {
  suit: Suit;
  rank: string;
  value: number;
}

export interface PlayerPosition {
  row: number;
  col: number;
}

export interface Player {
  id: number;
  position: PlayerPosition;
  isFinished: boolean;
  type: 'human' | 'cpu';
}

export interface Cell {
  card: Card;
  isInvalid: boolean;
  occupiedBy?: number;
}

export type Grid = Cell[][];
