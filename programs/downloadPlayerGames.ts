#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env --unstable

import * as fs from "https://deno.land/std@0.103.0/fs/mod.ts";

import { parseCliArgs } from "../backend/deps.ts";

import dataDir from "../backend/dataDir.ts";
import OgsApi from "../common/OgsApi.ts";

const args = parseCliArgs(Deno.args);

const [playerId] = args._;

if (typeof playerId !== "number") {
  console.error("Usage: downloadPlayerGames <player-id>");
  Deno.exit(1);
}

const playerDir = `${dataDir}/gamesByPlayerId/${playerId}`;
fs.ensureDir(playerDir);

const api = new OgsApi("https://online-go.com");

for await (const game of api.Games(playerId)) {
  const sgf = await api.Sgf(game.id);

  if (sgf === null) {
    console.warn(`Game ${game.id} not found`);
    continue;
  }

  const filePath = `${playerDir}/${game.id}.json`;
  await Deno.writeTextFile(filePath, JSON.stringify({ ogs: game, sgf }));

  console.log(`Downloaded ${filePath}`);
}
