#!/usr/bin/env -S deno run --allow-env --allow-read

import RawGameRecords from "../src/RawGameRecords.ts";
import SimpleGameData from "../src/SimpleGameData.ts";

for await (const game of RawGameRecords()) {
  console.log(SimpleGameData(game));
  break;
}
