#!/usr/bin/env -S deno run --unstable --allow-env --allow-read --allow-write

import * as fs from "https://deno.land/std@0.103.0/fs/mod.ts";

import addGameToDatabase from "../common/addGameToDatabase.ts";
import RawGameRecords from "../backend/RawGameRecords.ts";
import SimpleGameData from "../common/SimpleGameData.ts";
import SQLiteDatabase from "../backend/SQLiteDatabase.ts";
import dataDir from "../backend/dataDir.ts";
import externalBotIds from "../backend/externalBotIds.ts";
import IDatabase from "../common/IDatabase.ts";
import DbMetadata from "../backend/DbMetadata.ts";

type DbAndMeta = {
  db: IDatabase;
  meta: DbMetadata;
};

const dbMetamap = new Map<string, DbAndMeta>();

const dir = `${dataDir}/databases/${Date.now()}`;
await fs.ensureDir(dir);

let count = 0;
let totalCount = 0;
let reports = 0;
const startTime = performance.now();

let lastReportTime = startTime;
let lastReportCount = count;

const excludeBots = true;

// Exclude players without an accurate rank. For new players this value is 350
// but it comes down quickly and most regular players are around 60.
const maxRatingStdev = 100;

// Maximum difference between player ranks
const maxRankDiff = 3;

const liveOnly = true; // Not correspondence

const sampleRatio = 1;
const rawGameRecords = RawGameRecords(() => Math.random() < sampleRatio);

for await (const raw of rawGameRecords) {
  totalCount++;

  if ("error" in raw) {
    Deno.stdout.write(new TextEncoder().encode("x"));
    continue;
  }

  if ((raw.ogs as Record<string, unknown>).mode === "demo") {
    Deno.stdout.write(new TextEncoder().encode("d"));
    continue;
  }

  let game;

  try {
    game = SimpleGameData(raw);
  } catch (error) {
    console.error([
      `\nFailed to derive SimpleGameData from ogs:game:${raw.ogs.id} -`,
      error.stack,
      "\n",
    ].join(" "));

    continue;
  }

  const dbAndMeta = allocate(game);

  if (dbAndMeta === null) {
    continue;
  }

  const { db, meta } = dbAndMeta;

  await addGameToDatabase(db, game);
  meta.count++;
  Deno.stdout.write(new TextEncoder().encode("."));
  count++;

  if (Math.floor(totalCount / 1000) > reports) {
    const now = performance.now();

    const gamesPerSec = 1000 * (count - lastReportCount) /
      (now - lastReportTime);

    const duration = now - startTime;
    const min = Math.floor(duration / 60000);
    const sec = Math.floor((duration - 60000 * min) / 1000);

    console.log([
      "\n",
      `${min}m${sec}s: ${count} included (${Math.round(gamesPerSec)}/sec), `,
      `${totalCount} total`,
      "\n",
    ].join(""));

    reports++;
    lastReportTime = now;
    lastReportCount = count;
  }
}

await writeIndex();
console.log(`\nCreated ${dir} with ${count} games`);

function allocate(game: SimpleGameData): DbAndMeta | null {
  if (game.outcome === null) {
    Deno.stdout.write(new TextEncoder().encode("n"));
    return null;
  }

  if (excludeBots) {
    if (
      externalBotIds.includes(game.players.black.externalId) ||
      externalBotIds.includes(game.players.white.externalId)
    ) {
      Deno.stdout.write(new TextEncoder().encode("b"));
      return null;
    }
  }

  if (!game.ranked) {
    Deno.stdout.write(new TextEncoder().encode("r"));
    return null;
  }

  for (const player of [game.players.black, game.players.white]) {
    if (player.ratingStdev > maxRatingStdev) {
      Deno.stdout.write(new TextEncoder().encode("s"));
      return null;
    }
  }

  if (liveOnly && game.speed !== "live") {
    Deno.stdout.write(new TextEncoder().encode("l"));
    return null;
  }

  const ranks = Object.values(game.players).map((p) => p.rank);
  const rankDiff = ranks[0] - ranks[1];

  if (rankDiff > maxRankDiff) {
    return null;
  }

  const rankMean = 0.5 * (ranks[0] + ranks[1]);
  const rankBand = Math.floor(rankMean / 3);
  let rankBandStr: string;

  if (rankBand < 10) {
    const i = 9 - rankBand;
    rankBandStr = `${3 * i + 1}-${3 * i + 3}k`;
  } else {
    const i = rankBand - 10;
    rankBandStr = `${3 * i + 1}-${3 * i + 3}d`;
  }

  const sizeStr = `${game.height}x${game.width}`;
  const komiStr = `${game.komi}komi`.replace(".", "p").replace("-", "neg");

  const filebase = [sizeStr, komiStr, rankBandStr.replace("-", "to")].join("-");
  const filename = `${filebase}.sqlite`;

  const existing = dbMetamap.get(filename);

  if (existing) {
    return existing;
  }

  const db = new SQLiteDatabase(`${dir}/${filename}`);

  const dbAndMeta: DbAndMeta = {
    db,
    meta: {
      name: [sizeStr, `${game.komi} komi`, rankBandStr].join(", "),
      count: 0,
      filename,
      start: {
        width: game.width,
        height: game.height,
        komi: game.komi,
      },
    },
  };

  dbMetamap.set(filename, dbAndMeta);

  return dbAndMeta;
}

async function writeIndex() {
  await Deno.writeFile(
    `${dir}/index.json`,
    new TextEncoder().encode(JSON.stringify(
      [...dbMetamap.values()]
        .map(({ meta }) => meta)
        .sort((a, b) => b.count - a.count),
      null,
      2,
    )),
  );
}
