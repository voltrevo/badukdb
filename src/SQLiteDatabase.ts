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

    CREATE UNIQUE INDEX IF NOT EXISTS idx_moves_board ON moves (board);

    CREATE TABLE IF NOT EXISTS players (
      id BLOB PRIMARY KEY
    );
  `);
}

function Queries(db: sqlite.DB) {
  return {
    insertGame: db.prepareQuery(`
      INSERT INTO games (
        id, black, white, startBoard, result
      ) VALUES (
        :id, :black, :white, :startBoard, :result
      )
    `),

    lookupGame: db.prepareQuery(`
      SELECT * FROM games WHERE id = :id LIMIT 1
    `),

    insertBoard: db.prepareQuery(`
      INSERT INTO boards (
        hash, colorToPlay, offboardPoints, width, height, content
      ) VALUES (
        :hash, :colorToPlay, :offboardPoints, :width, :height, :content
      )
    `),

    lookupBoard: db.prepareQuery(`
      SELECT * FROM boards WHERE hash = :hash LIMIT 1
    `),

    insertMove: db.prepareQuery(`
      INSERT INTO moves (
        game, number, board, location, player, gameResult
      ) VALUES (
        :game, :number, :board, :location, :player, :gameResult
      )
    `),

    lookupMove: db.prepareQuery(`
      SELECT * from moves
      WHERE
        game = :game AND
        number = :number
      LIMIT 1
    `),

    insertPlayer: db.prepareQuery(`
      INSERT INTO players (
        id
      ) VALUES (
        :id
      )
    `),

    lookupPlayer: db.prepareQuery(`
      SELECT * from players WHERE id = :id LIMIT 1
    `),

    findMoves: db.prepareQuery(`
      #
    `),
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
