import { tb } from "../deps.ts";

import dataDir from "./dataDir.ts";
import OgsApi from "./OgsApi.ts";

const gamesDir = `${dataDir}/gamesByPlayerId`;

export const RawGameRecord = tb.Object({
  ogs: OgsApi.Game,
  sgf: tb.string,
});

export type RawGameRecord = tb.TypeOf<typeof RawGameRecord>;

export default async function* RawGameRecords(): AsyncGenerator<RawGameRecord> {
  const dirsToRead = [gamesDir];

  while (true) {
    const dir = dirsToRead.shift();

    if (dir === undefined) {
      break;
    }

    for await (const entry of Deno.readDir(dir)) {
      const entryPath = `${dir}/${entry.name}`;

      if (entry.isDirectory) {
        dirsToRead.push(entryPath);
      } else if (entryPath.endsWith(".json")) {
        try {
          yield tb.JSON.parse(
            RawGameRecord,
            await Deno.readTextFile(entryPath),
          );
        } catch (e) {
          console.error(`${entryPath} error: ${e.message}`);
        }
      }
    }
  }
}
