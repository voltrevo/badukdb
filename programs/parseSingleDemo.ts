#!/usr/bin/env -S deno run --allow-env --allow-read

import RawGameRecords from "../backend/RawGameRecords.ts";
import SimpleGameData from "../common/SimpleGameData.ts";

for await (const game of RawGameRecords()) {
  console.log(SimpleGameData(game));
  break;
}
