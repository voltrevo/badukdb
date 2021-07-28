import { BoardHash, Player, PlayerId } from "../src/entities.ts";
import Hash from "../src/Hash.ts";
import { RandomId } from "../src/Id.ts";
import SQLiteDatabase from "../src/SQLiteDatabase.ts";
import { assertEquals } from "./deps.ts";

Deno.test("find moves on non-existent board", async () => {
  const db = new SQLiteDatabase();
  const board = BoardHash(Hash(Uint8Array.from([])));

  for await (const _move of db.findMoves(board)) {
    throw new Error("Didn't expect to find anything");
  }
});

Deno.test("insert player and retrieve", async () => {
  const db = new SQLiteDatabase();

  const player: Player = {
    id: PlayerId(RandomId()),
  };

  db.insertPlayer(player);
  const retrievedPlayer = await db.lookupPlayer(player.id);

  assertEquals(retrievedPlayer, player);
});
