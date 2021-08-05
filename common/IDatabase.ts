import { Color } from "./BoardClass.ts";
import { tb } from "./deps.ts";
import {
  Board,
  BoardHash,
  Game,
  GameId,
  Location,
  Move,
  Player,
  PlayerId,
} from "./entities.ts";

export const MoveStat = tb.Object({
  location: tb.Optional(Location),
  color: Color,
  result: tb.number,
  count: tb.number,
  detail: tb.Optional(tb.Array(tb.Object({
    result: tb.number,
    externalId: tb.string,
  }))),
});

export type MoveStat = tb.TypeOf<typeof MoveStat>;

export const popularBoardDataVersion = 1;
export const PopularBoardData = tb.Array(MoveStat);
export type PopularBoardData = tb.TypeOf<typeof PopularBoardData>;

type IDatabase = {
  insertGame(game: Game): Promise<void>;
  lookupGame(id: GameId): Promise<Game | null>;

  insertBoard(board: Board): Promise<void>;
  lookupBoard(hash: BoardHash): Promise<Board | null>;

  insertPopularBoardData(
    hash: BoardHash,
    data: PopularBoardData,
  ): Promise<void>;
  lookupPopularBoardData(hash: BoardHash): Promise<PopularBoardData | null>;

  insertMove(move: Move): Promise<void>;
  lookupMove(game: GameId, number: number): Promise<Move | null>;

  insertPlayer(player: Player): Promise<void>;
  lookupPlayer(id: PlayerId): Promise<Player | null>;
  lookupPlayerByExternalId(externalId: string): Promise<Player | null>;

  findMoves(board: BoardHash): AsyncGenerator<Move>;

  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
};

export default IDatabase;
