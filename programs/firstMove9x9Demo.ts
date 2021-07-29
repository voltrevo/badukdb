#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write

import addGameToDatabase from "../src/addGameToDatabase.ts";
import BoardClass from "../src/BoardClass.ts";
import bs58check from "../src/helpers/bs58check.ts";
import RawGameRecords from "../src/RawGameRecords.ts";
import SimpleGameData from "../src/SimpleGameData.ts";
import SQLiteDatabase from "../src/SQLiteDatabase.ts";

const db = new SQLiteDatabase(`example${Date.now()}.db`);

for await (const raw of RawGameRecords()) {
  const game = SimpleGameData(raw);

  if (game.outcome === null) {
    continue;
  }

  await addGameToDatabase(db, game);
  Deno.stdout.write(new TextEncoder().encode("."));
}

Deno.stdout.write(new TextEncoder().encode("\n"));

const boardClass = new BoardClass(9, 9, 5.5);

for await (const move of db.findMoves(boardClass.Board().hash)) {
  console.log(
    bs58check.encode(move.player.value.value).slice(0, 5),
    bs58check.encode(move.board.value.value).slice(0, 5),
    move.location,
  );
}
