import { sqlite } from "../deps.ts";

import {
  Board,
  BoardHash,
  Game,
  GameId,
  Move,
  Player,
  PlayerId,
} from "./entities.ts";

import IDatabase from "./IDatabase.ts";

export default class SQLiteDatabase implements IDatabase {
  insertGame(game: Game): Promise<void> {
    throw new Error("Method not implemented.");
  }

  lookupGame(id: GameId): Promise<Game | null> {
    throw new Error("Method not implemented.");
  }

  insertBoard(board: Board): Promise<void> {
    throw new Error("Method not implemented.");
  }

  lookupBoard(hash: BoardHash): Promise<Board | null> {
    throw new Error("Method not implemented.");
  }

  insertMove(move: Move): Promise<void> {
    throw new Error("Method not implemented.");
  }

  lookupMove(game: GameId, number: number): Promise<Move | null> {
    throw new Error("Method not implemented.");
  }

  insertPlayer(player: Player): Promise<void> {
    throw new Error("Method not implemented.");
  }

  lookupPlayer(id: PlayerId): Promise<Player | null> {
    throw new Error("Method not implemented.");
  }

  findMoves(board: BoardHash): Promise<Move[]> {
    throw new Error("Method not implemented.");
  }
}
