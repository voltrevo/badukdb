#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write

import addGameToDatabase from "../common/addGameToDatabase.ts";
import RawGameRecords from "../backend/RawGameRecords.ts";
import SimpleGameData from "../common/SimpleGameData.ts";
import SQLiteDatabase from "../backend/SQLiteDatabase.ts";
import dataDir from "../backend/dataDir.ts";
import externalBotIds from "../backend/externalBotIds.ts";

const filePath = `${dataDir}/db${Date.now()}.sqlite`;
const db = new SQLiteDatabase(filePath);
let count = 0;
let totalCount = 0;
let reports = 0;
const startTime = performance.now();

const excludeBots = true;

// Exclude players without an accurate rank. For new players this value is 350
// but it comes down quickly and most regular players are around 60.
const maxRatingStdev = 100;

const filterOnRank = true;
const rankFilterCenter = 22; // 8kyu
const rankFilterWidth = 3; // +/- 1.5

const liveOnly = true; // Not correspondence

const sizeFilter = "9x9";

for await (const raw of RawGameRecords()) {
  totalCount++;

  if ("error" in raw) {
    Deno.stdout.write(new TextEncoder().encode("x"));
    continue;
  }

  if ((raw.ogs as Record<string, unknown>).mode === "demo") {
    Deno.stdout.write(new TextEncoder().encode("d"));
    continue;
  }

  const game = SimpleGameData(raw);

  if (!ShouldInclude(game)) {
    continue;
  }

  await addGameToDatabase(db, game);
  Deno.stdout.write(new TextEncoder().encode("."));
  count++;

  if (Math.floor(totalCount / 1000) > reports) {
    console.log(
      `\n${performance.now() - startTime}ms: ${count}/${totalCount}\n`,
    );

    reports++;
  }
}

console.log(`\nCreated ${filePath} with ${count} games`);

function ShouldInclude(game: SimpleGameData): boolean {
  if (game.outcome === null) {
    Deno.stdout.write(new TextEncoder().encode("n"));
    return false;
  }

  if (excludeBots) {
    if (
      externalBotIds.includes(game.players.black.externalId) ||
      externalBotIds.includes(game.players.white.externalId)
    ) {
      Deno.stdout.write(new TextEncoder().encode("b"));
      return false;
    }
  }

  if (sizeFilter !== null && `${game.height}x${game.width}` !== sizeFilter) {
    Deno.stdout.write(new TextEncoder().encode("z"));
    return false;
  }

  if (!game.ranked) {
    Deno.stdout.write(new TextEncoder().encode("r"));
    return false;
  }

  for (const player of [game.players.black, game.players.white]) {
    if (player.ratingStdev > maxRatingStdev) {
      Deno.stdout.write(new TextEncoder().encode("s"));
      return false;
    }
  }

  if (liveOnly && game.speed !== "live") {
    Deno.stdout.write(new TextEncoder().encode("l"));
    return false;
  }

  if (filterOnRank) {
    for (const player of [game.players.black, game.players.white]) {
      if (Math.abs(player.rank - rankFilterCenter) > rankFilterWidth) {
        Deno.stdout.write(new TextEncoder().encode("r"));
        return false;
      }
    }
  }

  return true;
}
