import { sqlite } from "./deps.ts";

import {
  Board,
  BoardHash,
  Game,
  GameId,
  Move,
  Player,
  PlayerId,
} from "../common/entities.ts";

import { constructHash } from "../common/Hash.ts";
import Id from "../common/Id.ts";
import IDatabase from "../common/IDatabase.ts";

function createTablesIfNotExisting(db: sqlite.DB) {
  db.query(`
    CREATE TABLE IF NOT EXISTS games (
      id BLOB PRIMARY KEY,
      black BLOB NOT NULL,
      white BLOB NOT NULL,
      startBoard BLOB NOT NULL,
      result REAL NOT NULL
    );
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS boards (
      hash BLOB PRIMARY KEY,
      colorToPlay INTEGER NOT NULL,
      offboardPoints REAL NOT NULL,
      width INTEGER NOT NULL,
      height INTEGER NOT NULL,
      content BLOB NOT NULL
    );
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS moves (
      game BLOB NOT NULL,
      number INTEGER NOT NULL,
      board BLOB NOT NULL,
      locationX INTEGER,
      locationY INTEGER,
      color INTEGER NOT NULL,
      player BLOB NOT NULL,
      gameResult REAL NOT NULL,
      PRIMARY KEY (game, number)
    );
  `);

  db.query(`
    CREATE INDEX IF NOT EXISTS idx_moves_board ON moves (board);
  `);

  db.query(`
    CREATE TABLE IF NOT EXISTS players (
      id BLOB PRIMARY KEY,
      externalId TEXT NOT NULL
    );
  `);

  db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_players_ext ON players (externalId);
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
      INSERT OR REPLACE INTO boards (
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
        game, number, board, locationX, locationY, color, player, gameResult
      ) VALUES (
        :game, :number, :board, :locationX, :locationY, :color, :player, :gameResult
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
        id, externalId
      ) VALUES (
        :id, :externalId
      )
    `),

    lookupPlayer: db.prepareQuery(`
      SELECT * from players WHERE id = :id LIMIT 1
    `),

    lookupPlayerByExternalId: db.prepareQuery(`
      SELECT * from players WHERE externalId = :externalId LIMIT 1
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
      ":locationX": move.location?.x ?? null,
      ":locationY": move.location?.y ?? null,
      ":color": move.color,
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
      location: row[3] === null ? null : { x: row[3], y: row[4] },
      color: row[5] === 0 ? "black" : "white",
      player: PlayerId(Id(row[6])),
      gameResult: row[7],
    };
  }

  async insertPlayer(player: Player): Promise<void> {
    await Promise.resolve();

    this.queries.insertPlayer({
      ":id": player.id.value.value,
      ":externalId": player.externalId,
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
      externalId: row[1],
    };
  }

  async lookupPlayerByExternalId(externalId: string): Promise<Player | null> {
    await Promise.resolve();

    const [row] = this.queries.lookupPlayerByExternalId({
      ":externalId": externalId,
    });

    if (row === undefined) {
      return null;
    }

    return {
      id: PlayerId(Id(row[0])),
      externalId: row[1],
    };
  }

  async *findMoves(board: BoardHash): AsyncGenerator<Move> {
    await Promise.resolve();

    const rows = this.queries.findMoves({ ":board": board.value.value });

    for (const row of rows) {
      yield {
        game: GameId(Id(row[0])),
        number: row[1],
        board: BoardHash(constructHash(row[2])),
        location: row[3] === null ? null : { x: row[3], y: row[4] },
        color: row[5] === 0 ? "black" as const : "white" as const,
        player: PlayerId(Id(row[6])),
        gameResult: row[7],
      };
    }
  }
}
