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

function createTablesIfNotExisting(db: sqlite.DB) {
  db.query(`
    CREATE TABLE IF NOT EXISTS games (
      id BLOB PRIMARY KEY,
      black BLOB NOT NULL,
      white BLOB NOT NULL,
      startBoard BLOB NOT NULL,
      result REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS boards (
      hash BLOB PRIMARY KEY,
      colorToPlay INTEGER NOT NULL,
      offboardPoints REAL NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      content BLOB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS moves (
      game BLOB NOT NULL,
      number INTEGER NOT NULL,
      board BLOB NOT NULL,
      location TEXT NOT NULL,
      player BLOB NOT NULL,
      gameResult REAL NOT NULL,
      PRIMARY KEY (game, number)
    );

    CREATE TABLE IF NOT EXISTS players (
      id BLOB PRIMARY KEY
    );
  `);
}

function Queries(db: sqlite.DB) {
  return {
    insertGame: db.prepareQuery(""),
    lookupGame: db.prepareQuery(""),
    insertBoard: db.prepareQuery(""),
    lookupBoard: db.prepareQuery(""),
    insertMove: db.prepareQuery(""),
    lookupMove: db.prepareQuery(""),
    insertPlayer: db.prepareQuery(""),
    lookupPlayer: db.prepareQuery(""),
    findMoves: db.prepareQuery(""),
  };
}

export default class SQLiteDatabase implements IDatabase {
  db: sqlite.DB;
  queries: ReturnType<typeof Queries>;

  constructor(filePath?: string) {
    this.db = new sqlite.DB(filePath);
    createTablesIfNotExisting(this.db);
    this.queries = Queries(this.db);
  }

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
