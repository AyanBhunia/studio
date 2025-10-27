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

export interface Cell {
  card: Card;
  isInvalid: boolean;
}

export type Grid = Cell[][];
