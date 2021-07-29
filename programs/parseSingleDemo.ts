#!/usr/bin/env -S deno run --allow-env --allow-read

import parseSgf from "../src/sgf/parse.ts";
import RawGameRecords from "../src/RawGameRecords.ts";

for await (const game of RawGameRecords()) {
  console.log(parseSgf(game.sgf)[0].children);
  break;
}
