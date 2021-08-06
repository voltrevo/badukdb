import { tb } from "./deps.ts";

import { BoardHash } from "./entities.ts";
import { constructHash } from "./Hash.ts";
import fail from "./helpers/fail.ts";
import IDatabase, { MoveStat } from "./IDatabase.ts";
import Protocol, { DbListing } from "./Protocol.ts";

type MoveStatEntry = {
  result: number;
  count: number;
  detail: {
    result: number;
    playerDisplay: string;
  }[];
};

export default function implementProtocol(
  dbMap: Map<string, { listing: DbListing; db: IDatabase }>,
): tb.Implementation<typeof Protocol> {
  return {
    listDatabases: async () => {
      await Promise.resolve();

      return [...dbMap.values()]
        .map((v) => v.listing)
        .sort((a, b) => b.count - a.count);
    },
    findMoveStats: async (dbName, boardHashRaw) => {
      const startTime = performance.now();

      const db = dbMap.get(dbName)?.db;

      if (db === undefined) {
        console.warn(`Received request for unknown dbName ${dbName}`);

        return {
          moveStats: [],
          processingTime: performance.now() - startTime,
        };
      }

      const boardHash = BoardHash(constructHash(boardHashRaw));

      const popularMoveStats = await db.lookupPopularBoardData(boardHash);

      if (popularMoveStats !== null) {
        return {
          moveStats: popularMoveStats,
          processingTime: performance.now() - startTime,
        };
      }

      const moveMap = new Map<string, MoveStatEntry>();

      const moves = db.findMoves(boardHash);
      let moveCount = 0;

      for await (const move of moves) {
        moveCount++;

        const locationKey = move.location === null
          ? ""
          : `${move.location.x},${move.location.y}`;

        const key = `${move.color}:${locationKey}`;

        const entry = moveMap.get(key) ?? EmptyMoveStatEntry();

        entry.result += move.gameResult;
        entry.count++;

        entry.detail.push({
          result: move.gameResult,
          playerDisplay: move.playerDisplay,
        });

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

      if (moveCount >= 100) {
        await db.insertPopularBoardData(boardHash, moveStats);
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
