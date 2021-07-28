#!/usr/bin/env -S deno run --allow-env --allow-read

import parseSgf from "../src/sgf/parse.ts";
import dataDir from "../src/dataDir.ts";

const sgfDir = `${dataDir}/sgfByPlayerId`;
const dirsToRead = [sgfDir];

while (true) {
  const dir = dirsToRead.shift();

  if (dir === undefined) {
    break;
  }

  for await (const entry of Deno.readDir(dir)) {
    const entryPath = `${dir}/${entry.name}`;

    if (entry.isDirectory) {
      dirsToRead.push(entryPath);
    } else if (entryPath.endsWith(".sgf")) {
      const parsed = parseSgf(await Deno.readTextFile(entryPath));

      for (const node of parsed ?? []) {
        const date = (node.data.DT ?? []).join("");
        const black = (node.data.PB ?? []).join("");
        const white = (node.data.PW ?? []).join("");
        console.log(`${date}: ${black} v ${white}`);
      }
    }
  }
}
