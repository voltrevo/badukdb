import { sqlite } from "../deps.ts";

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

import { constructHash } from "./Hash.ts";
import Id from "./Id.ts";
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
      SELECT * from moves WHERE board = :board
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

  async insertGame(game: Game): Promise<void> {
    await Promise.resolve();

    this.queries.insertGame({
      ":id": game.id.value.value,
      ":black": game.black.value.value,
      ":white": game.white.value.value,
      ":startBoard": game.startBoard.value.value,
      ":result": game.result,
    });
  }

  async lookupGame(id: GameId): Promise<Game | null> {
    await Promise.resolve();

    const [row] = this.queries.lookupGame({ ":id": id.value.value });

    if (row === undefined) {
      return null;
    }

    return {
      id: GameId(Id(row[0])),
      black: PlayerId(Id(row[1])),
      white: PlayerId(Id(row[2])),
      startBoard: BoardHash(constructHash(row[3])),
      result: row[4],
    };
  }

  async insertBoard(board: Board): Promise<void> {
    await Promise.resolve();

    this.queries.insertBoard({
      ":hash": board.hash.value.value,
      ":colorToPlay": board.colorToPlay === "black" ? 0 : 1,
      ":offboardPoints": board.offboardPoints,
      ":width": board.width,
      ":height": board.height,
      ":content": board.content,
    });
  }

  async lookupBoard(hash: BoardHash): Promise<Board | null> {
    await Promise.resolve();

    const [row] = this.queries.lookupBoard({ ":hash": hash.value.value });

    if (row === undefined) {
      return null;
    }

    return {
      hash: BoardHash(constructHash(row[0])),
      colorToPlay: row[1] === 0 ? "black" : "white",
      offboardPoints: row[2],
      width: row[3],
      height: row[4],
      content: row[5],
    };
  }

  async insertMove(move: Move): Promise<void> {
    await Promise.resolve();

    this.queries.insertMove({
      ":game": move.game.value.value,
      ":number": move.number,
      ":board": move.board.value.value,
      ":location": move.location.value,
      ":player": move.player.value.value,
      ":gameResult": move.gameResult,
    });
  }

  async lookupMove(game: GameId, number: number): Promise<Move | null> {
    await Promise.resolve();

    const [row] = this.queries.lookupMove({
      ":game": game.value.value,
      ":number": number,
    });

    if (row === undefined) {
      return null;
    }

    return {
      game: GameId(Id(row[0])),
      number: row[1],
      board: BoardHash(constructHash(row[2])),
      location: Location(row[3]),
      player: PlayerId(Id(row[4])),
      gameResult: row[5],
    };
  }

  async insertPlayer(player: Player): Promise<void> {
    await Promise.resolve();

    this.queries.insertPlayer({
      ":id": player.id.value.value,
    });
  }

  async lookupPlayer(id: PlayerId): Promise<Player | null> {
    await Promise.resolve();

    const [row] = this.queries.lookupPlayer({ ":id": id.value.value });

    if (row === undefined) {
      return null;
    }

    return {
      id: PlayerId(Id(row[0])),
    };
  }

  async *findMoves(board: BoardHash) {
    await Promise.resolve();

    const rows = this.queries.findMoves({ ":board": board.value.value });

    for (const row of rows) {
      yield {
        game: GameId(Id(row[0])),
        number: row[1],
        board: BoardHash(constructHash(row[2])),
        location: Location(row[3]),
        player: PlayerId(Id(row[4])),
        gameResult: row[5],
      };
    }
  }
}
