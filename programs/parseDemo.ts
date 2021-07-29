#!/usr/bin/env -S deno run --allow-env --allow-read

import parseSgf from "../src/sgf/parse.ts";
import RawGameRecords from "../src/RawGameRecords.ts";

for await (const game of RawGameRecords()) {
  const parsed = parseSgf(game.sgf);

  for (const node of parsed) {
    const date = (node.data.DT ?? []).join("");
    const black = (node.data.PB ?? []).join("");
    const white = (node.data.PW ?? []).join("");

    const predictedTitle = `${black} vs. ${white}`;
    const actualTitle = game.ogs.name;

    let msg = `${date}: ${predictedTitle}`;

    if (actualTitle !== predictedTitle) {
      msg += ` - ${actualTitle}`;
    }

    console.log(msg);
  }
}
