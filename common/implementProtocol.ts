import { tb } from "./deps.ts";

import { BoardHash, Location } from "./entities.ts";
import { constructHash } from "./Hash.ts";
import IDatabase from "./IDatabase.ts";
import Protocol from "./Protocol.ts";

export default function implementProtocol(
  db: IDatabase,
): tb.Implementation<typeof Protocol> {
  return {
    findMoveStats: async (boardHash) => {
      const startTime = performance.now();

      const moveMap = new Map<
        string,
        { count: number; externalIds: string[] }
      >();
      const moves = db.findMoves(BoardHash(constructHash(boardHash)));

      for await (const move of moves) {
        const key = move.location === null
          ? ""
          : `${move.location.x},${move.location.y}`;

        const entry = moveMap.get(key) ?? { count: 0, externalIds: [] };
        entry.count++;

        const player = await db.lookupPlayer(move.player);

        if (player) {
          entry.externalIds.push(player.externalId);
        }

        moveMap.set(key, entry);
      }

      const moveStats: {
        location: Location | null;
        count: number;
        externalIds: string[];
      }[] = [];

      for (const [key, entry] of moveMap.entries()) {
        const location = (() => {
          if (key === "") {
            return null;
          }

          const [x, y] = key.split(",").map(Number);
          return { x, y };
        })();

        moveStats.push({
          location,
          ...entry,
        });
      }

      return {
        moveStats,
        processingTime: performance.now() - startTime,
      };
    },
  };
}
