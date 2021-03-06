#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write

import addGameToDatabase from "../common/addGameToDatabase.ts";
import BoardClass from "../common/BoardClass.ts";
import bs58check from "../common/helpers/bs58check.ts";
import RawGameRecords from "../backend/RawGameRecords.ts";
import SimpleGameData from "../common/SimpleGameData.ts";
import SQLiteDatabase from "../backend/SQLiteDatabase.ts";

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
