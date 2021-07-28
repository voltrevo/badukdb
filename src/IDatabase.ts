import Hash from "./Hash.ts";
import Id from "./Id.ts";
import Nominal from "./Nominal.ts";

const GameId = Nominal("GameId")<Id>();
type GameId = ReturnType<typeof GameId>;

const PlayerId = Nominal("PlayerId")<Id>();
type PlayerId = ReturnType<typeof PlayerId>;

const BoardHash = Nominal("BoardHash")<Hash>();
type BoardHash = ReturnType<typeof BoardHash>;

const Time = Nominal("Time")<number>();
type Time = ReturnType<typeof Time>;

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
  colorToPlay: "black" | "white";
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
  location: { x: number; y: number };
  player: PlayerId;
  gameResult: number;
};

export type Player = {
  id: PlayerId;
  // TODO: name, etc
};

type IDatabase = {};

export default IDatabase;
