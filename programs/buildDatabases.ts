#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write

import { tb } from "../backend/deps.ts";

import addGameToDatabase from "../common/addGameToDatabase.ts";
import RawGameRecords from "../backend/RawGameRecords.ts";
import SimpleGameData from "../common/SimpleGameData.ts";
import SQLiteDatabase from "../backend/SQLiteDatabase.ts";
import dataDir from "../backend/dataDir.ts";
import externalBotIds from "../backend/externalBotIds.ts";
import IDatabase from "../common/IDatabase.ts";

const DbMetadata = tb.Object({
  name: tb.string,
  count: tb.size,
  filename: tb.string,
  start: tb.Object({
    width: tb.size,
    height: tb.size,
    komi: tb.number,
  }),
});

type DbMetadata = tb.TypeOf<typeof DbMetadata>;

type DbAndMeta = {
  db: IDatabase;
  meta: DbMetadata;
};

const dbMetamap = new Map<string, DbAndMeta>();

const dir = `${dataDir}/databases/${Date.now()}`;

let count = 0;
let totalCount = 0;
let reports = 0;
const startTime = performance.now();

const excludeBots = true;

// Exclude players without an accurate rank. For new players this value is 350
// but it comes down quickly and most regular players are around 60.
const maxRatingStdev = 100;

// Maximum difference between player ranks
const maxRankDiff = 3;

const liveOnly = true; // Not correspondence

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

  const dbAndMeta = allocate(game);

  if (dbAndMeta === null) {
    continue;
  }

  const { db, meta } = dbAndMeta;

  await addGameToDatabase(db, game);
  meta.count++;
  Deno.stdout.write(new TextEncoder().encode("."));
  count++;

  await writeIndex();

  if (Math.floor(totalCount / 1000) > reports) {
    console.log(
      `\n${performance.now() - startTime}ms: ${count}/${totalCount}\n`,
    );

    reports++;
  }
}

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
    rankBandStr = `${i + 1}-${i + 2}k`;
  } else {
    const i = rankBand - 10;
    rankBandStr = `${i + 1}-${i + 2}d`;
  }

  const sizeStr = `${game.height}x${game.width}`;
  const komiStr = `${game.komi}komi`.replace(".", "p");

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

  return dbAndMeta;
}

async function writeIndex() {
  await Deno.writeFile(
    `${dir}/index.json`,
    new TextEncoder().encode(JSON.stringify(
      [...dbMetamap.values()].map(({ meta }) => meta),
      null,
      2,
    )),
  );
}
