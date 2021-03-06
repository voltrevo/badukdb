import addGameToDatabase from "../common/addGameToDatabase.ts";
import BoardClass from "../common/BoardClass.ts";
import SimpleGameData from "../common/SimpleGameData.ts";
import SQLiteDatabase from "../backend/SQLiteDatabase.ts";
import { assertEquals } from "./deps.ts";
import RawGameRecordExample from "./helpers/RawGameRecordExample.ts";

Deno.test("addGameToDatabase adds example without errors", async () => {
  const db = new SQLiteDatabase();
  const raw = RawGameRecordExample();
  const game = SimpleGameData(raw);

  await addGameToDatabase(db, game);
});

Deno.test("addGameToDatabase opening board shows only one move", async () => {
  const db = new SQLiteDatabase();
  const raw = RawGameRecordExample();
  const game = SimpleGameData(raw);

  await addGameToDatabase(db, game);

  const boardClass = new BoardClass(game.width, game.height, game.komi);

  let count = 0;

  for await (const _move of db.findMoves(boardClass.Board().hash)) {
    count++;
  }

  assertEquals(count, 1);
});
