import { tb } from "../../deps.ts";

import { BoardHash, Location } from "../entities.ts";
import { constructHash } from "../Hash.ts";
import IDatabase from "../IDatabase.ts";
import Protocol from "./Protocol.ts";

export default function implementProtocol(
  db: IDatabase,
): tb.Implementation<typeof Protocol> {
  return {
    findMoveStats: async (boardHash) => {
      const moveMap = new Map<string, number>();
      const moves = db.findMoves(BoardHash(constructHash(boardHash)));

      for await (const move of moves) {
        const key = move.location === null
          ? ""
          : `${move.location.x},${move.location.y}`;

        const count = moveMap.get(key) ?? 0;
        moveMap.set(key, count + 1);
      }

      const moveStats: { location: Location | null; count: number }[] = [];

      for (const [key, count] of moveMap.entries()) {
        const location = (() => {
          if (key === "") {
            return null;
          }

          const [x, y] = key.split(",").map(Number);
          return { x, y };
        })();

        moveStats.push({ location, count });
      }

      return moveStats;
    },
  };
}
