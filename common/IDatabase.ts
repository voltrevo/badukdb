import {
  Board,
  BoardHash,
  Game,
  GameId,
  Move,
  Player,
  PlayerId,
} from "./entities.ts";

type IDatabase = {
  insertGame(game: Game): Promise<void>;
  lookupGame(id: GameId): Promise<Game | null>;

  insertBoard(board: Board): Promise<void>;
  lookupBoard(hash: BoardHash): Promise<Board | null>;

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
