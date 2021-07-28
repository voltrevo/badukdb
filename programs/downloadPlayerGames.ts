#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env --unstable

import * as fs from "https://deno.land/std@0.103.0/fs/mod.ts";

import { parseCliArgs } from "../deps.ts";

import dataDir from "../src/dataDir.ts";
import OgsApi from "../src/OgsApi.ts";

const args = parseCliArgs(Deno.args);

const [playerId] = args._;

if (typeof playerId !== "number") {
  console.error("Usage: downloadPlayerGames <player-id>");
  Deno.exit(1);
}

const playerDir = `${dataDir}/sgfByPlayerId/${playerId}`;
fs.ensureDir(playerDir);

const api = new OgsApi("https://online-go.com");

for await (const game of api.Games(playerId)) {
  const sgf = await api.Sgf(game.id);

  if (sgf === null) {
    console.warn(`Game ${game.id} not found`);
    continue;
  }

  const filePath = `${playerDir}/${game.id}.sgf`;
  await Deno.writeTextFile(filePath, sgf);
  console.log(`Downloaded ${filePath}`);
}
