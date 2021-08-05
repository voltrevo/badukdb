import { tb } from "./deps.ts";

import { BoardHash } from "./entities.ts";
import { constructHash } from "./Hash.ts";
import fail from "./helpers/fail.ts";
import IDatabase from "./IDatabase.ts";
import Protocol, { MoveStat } from "./Protocol.ts";

type MoveStatEntry = {
  result: number;
  count: number;
  detail: {
    result: number;
    externalId: string;
  }[];
};

export default function implementProtocol(
  db: IDatabase,
): tb.Implementation<typeof Protocol> {
  return {
    findMoveStats: async (boardHash) => {
      const startTime = performance.now();

      const moveMap = new Map<string, MoveStatEntry>();

      const moves = db.findMoves(BoardHash(constructHash(boardHash)));

      for await (const move of moves) {
        const locationKey = move.location === null
          ? ""
          : `${move.location.x},${move.location.y}`;

        const key = `${move.color}:${locationKey}`;

        const entry = moveMap.get(key) ?? EmptyMoveStatEntry();

        entry.result += move.gameResult;
        entry.count++;

        const player = await db.lookupPlayer(move.player);

        if (player) {
          entry.detail.push({
            result: move.gameResult,
            externalId: player.externalId,
          });
        }

        moveMap.set(key, entry);
      }

      const moveStats: MoveStat[] = [];

      for (const [key, entry] of moveMap.entries()) {
        const { color, location } = (() => {
          const [color, xy] = key.split(":");

          const location = xy === "" ? null : (() => {
            const [x, y] = xy.split(",").map(Number);
            return { x, y };
          })();

          return {
            color: color === "black"
              ? "black" as const
              : color === "white"
              ? "white" as const
              : fail(),
            location,
          };
        })();

        moveStats.push({
          location,
          color,
          ...entry,
          detail: entry.detail.length > 10 ? null : entry.detail,
        });
      }

      return {
        moveStats,
        processingTime: performance.now() - startTime,
      };
    },
  };
}

function EmptyMoveStatEntry(): MoveStatEntry {
  return {
    result: 0,
    count: 0,
    detail: [],
  };
}
