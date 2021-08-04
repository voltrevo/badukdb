#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write

import addGameToDatabase from "../common/addGameToDatabase.ts";
import RawGameRecords from "../backend/RawGameRecords.ts";
import SimpleGameData from "../common/SimpleGameData.ts";
import SQLiteDatabase from "../backend/SQLiteDatabase.ts";
import dataDir from "../backend/dataDir.ts";

const filePath = `${dataDir}/db${Date.now()}.sqlite`;
const db = new SQLiteDatabase(filePath);
let count = 0;

for await (const raw of RawGameRecords()) {
  if ("error" in raw) {
    Deno.stdout.write(new TextEncoder().encode("x"));
    continue;
  }

  if ((raw.ogs as Record<string, unknown>).mode === "demo") {
    Deno.stdout.write(new TextEncoder().encode("d"));
    continue;
  }

  const game = SimpleGameData(raw);

  if (game.outcome === null) {
    Deno.stdout.write(new TextEncoder().encode("n"));
    continue;
  }

  if (`${game.height}x${game.width}` !== "19x19") {
    Deno.stdout.write(new TextEncoder().encode("f"));
    continue;
  }

  if (!game.ranked) {
    Deno.stdout.write(new TextEncoder().encode("f"));
    continue;
  }

  const rankGap = game.players.white.rank - game.players.black.rank;

  if (Math.abs(rankGap) > 2.5) {
    Deno.stdout.write(new TextEncoder().encode("f"));
    continue;
  }

  const meanRank = 0.5 * (game.players.white.rank + game.players.black.rank);
  const kyu8 = 22;

  if (Math.abs(meanRank - kyu8) > 1.5) {
    Deno.stdout.write(new TextEncoder().encode("f"));
    continue;
  }

  await addGameToDatabase(db, game);
  Deno.stdout.write(new TextEncoder().encode("."));
  count++;
}

console.log(`\nCreated ${filePath} with ${count} games`);
