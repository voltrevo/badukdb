#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write

import dataDir from "../backend/dataDir.ts";
import SQLiteDatabase from "../backend/SQLiteDatabase.ts";

const db = new SQLiteDatabase(`${dataDir}/db.sqlite`);

console.log([...db.db.query(
  `

    -- SELECT * FROM players WHERE externalId = 'ogs:player:776366'
    SELECT * FROM moves WHERE board = :board

  `,
  {
    ":board": Uint8Array.from([
      24,
      62,
      34,
      53,
      116,
      182,
      22,
      34,
      142,
      168,
      172,
      36,
      232,
      74,
      222,
      174,
      27,
      108,
      139,
      193,
      37,
      160,
      186,
      114,
      102,
      183,
      8,
      115,
      136,
      192,
      88,
      203,
    ]),
  },
)]);
