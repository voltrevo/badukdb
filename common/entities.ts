import type { Color } from "./BoardClass.ts";
import { tb } from "./deps.ts";
import Hash from "./Hash.ts";
import Id from "./Id.ts";
import Nominal from "./Nominal.ts";

export const GameId = Nominal("GameId")<Id>();
export type GameId = ReturnType<typeof GameId>;

export const PlayerId = Nominal("PlayerId")<Id>();
export type PlayerId = ReturnType<typeof PlayerId>;

export const BoardHash = Nominal("BoardHash")<Hash>();
export type BoardHash = ReturnType<typeof BoardHash>;

export const Time = Nominal("Time")<number>();
export type Time = ReturnType<typeof Time>;

export const Location = tb.Object({
  x: tb.number,
  y: tb.number,
});

export type Location = tb.TypeOf<typeof Location>;

export type Game = {
  id: GameId;
  black: PlayerId;
  white: PlayerId;
  startBoard: BoardHash;
  result: number;
  // TODO: Ranks, time played, settings, etc
};

export type Board = {
  hash: BoardHash;
  colorToPlay: Color;
  offboardPoints: number;
  width: number;
  height: number;
  // TODO: illegal ko locations? (maybe can't handle superko)
  content: Uint8Array;
};

export type Move = {
  game: GameId;
  number: number;
  board: BoardHash;
  location: Location | null;
  color: Color;
  player: PlayerId;
  gameResult: number;
};

export type Player = {
  id: PlayerId;
  externalId: string;
  // TODO: name, etc
};
