import { BoardHash } from "../src/entities.ts";
import Hash from "../src/Hash.ts";
import SQLiteDatabase from "../src/SQLiteDatabase.ts";

Deno.test("find moves on non-existent board", async () => {
  const db = new SQLiteDatabase();
  const board = BoardHash(Hash(Uint8Array.from([])));

  for await (const _move of db.findMoves(board)) {
    throw new Error("Didn't expect to find anything");
  }
});
