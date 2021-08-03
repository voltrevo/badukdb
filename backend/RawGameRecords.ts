import { tb } from "./deps.ts";

import dataDir from "./dataDir.ts";
import RawGameRecord from "../common/RawGameRecord.ts";

const gamesDir = `${dataDir}/ogs/games`;

export default async function* RawGameRecords(): AsyncGenerator<
  RawGameRecord | { entryPath: string; error: Error }
> {
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
          yield { entryPath, error: e };
        }
      }
    }
  }
}
