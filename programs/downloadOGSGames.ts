#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write --allow-env --unstable

import * as fs from "https://deno.land/std@0.103.0/fs/mod.ts";

import { parseCliArgs } from "../backend/deps.ts";

import dataDir from "../backend/dataDir.ts";
import OgsApi from "../common/OgsApi.ts";
import assert from "../common/helpers/assert.ts";

const args = parseCliArgs(Deno.args);

const [rangeStart, rangeEnd, stride] = args._;

for (const [k, v] of Object.entries({ rangeStart, rangeEnd, stride })) {
  if (typeof v !== "number") {
    console.error(`Error: number required for ${k}`);
    exitUsageError();
  }
}

assert(typeof rangeStart === "number");
assert(typeof rangeEnd === "number");
assert(typeof stride === "number");

const rangeLen = rangeEnd - rangeStart;

if (gcd(rangeLen, stride) !== 1) {
  console.error([
    "Stride needs to be coprime with the range length to ensure the range is",
    "covered.",
  ].join(" "));

  exitUsageError();
}

const api = new OgsApi("https://online-go.com");

for (let i = 0; i < rangeLen; i++) {
  const gameId = rangeStart + (i * stride) % rangeLen;
  const filePath = await FilePath(gameId);

  try {
    if (await fs.exists(filePath)) {
      console.log(`Already exists: ${filePath}`);
      continue;
    }

    const sgf = await api.Sgf(gameId);

    if (sgf === null) {
      console.warn(`Game ${gameId} not found`);
      continue;
    }

    const game = await api.Game(gameId);

    await Deno.writeTextFile(filePath, JSON.stringify({ ogs: game, sgf }));

    console.log(`Downloaded: ${filePath}`);
  } catch (error) {
    await Deno.writeTextFile(filePath, JSON.stringify({ error: true }));
    console.error(`Error: ${filePath}: ${error.message}`);
    continue;
  }
}

async function FilePath(gameId: number) {
  const digits = gameId.toString().padStart(9, "0");

  const dir = (
    `${dataDir}/ogs/games/${digits.slice(0, 3)}/${digits.slice(3, 6)}`
  );

  await fs.ensureDir(dir);

  return `${dir}/${digits.slice(6, 9)}.json`;
}

function exitUsageError(): never {
  console.error("Usage: downloadOGSGames <rangeStart> <rangeEnd> <stride>");
  Deno.exit(1);
}

function gcd(a: number, b: number) {
  a = Math.abs(a);
  b = Math.abs(b);

  if (b > a) {
    [a, b] = [b, a];
  }

  while (true) {
    if (b === 0) {
      return a;
    }

    a %= b;

    if (a === 0) {
      return b;
    }

    b %= a;
  }
}
