#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write

import addGameToDatabase from "../common/addGameToDatabase.ts";
import RawGameRecords from "../backend/RawGameRecords.ts";
import SimpleGameData from "../common/SimpleGameData.ts";
import SQLiteDatabase from "../backend/SQLiteDatabase.ts";
import dataDir from "../backend/dataDir.ts";

const db = new SQLiteDatabase(`${dataDir}/db.sqlite`);

for await (const raw of RawGameRecords()) {
  const game = SimpleGameData(raw);

  if (game.outcome === null) {
    continue;
  }

  await addGameToDatabase(db, game);
  Deno.stdout.write(new TextEncoder().encode("."));
}

Deno.stdout.write(new TextEncoder().encode("\n"));

console.log("done");
