import { BoundedGoban, preact, tb } from "./deps.ts";

import { apiPort } from "../common/constants.ts";
import WebSocketBufferIO from "../common/WebSocketBufferIO.ts";
import Protocol from "../common/Protocol.ts";
import BoardClass from "../common/BoardClass.ts";
import { default as SignMap, FillSignMap } from "./SignMap.ts";

const bufferIO = new WebSocketBufferIO(
  new WebSocket(`ws://localhost:${apiPort}/`),
);

const boardClass = new BoardClass(9, 9, 5.5);

const api = tb.Client(bufferIO, Protocol);

type GhostStone = (
  | null
  | {
    sign: -1 | 0 | 1;
    type?: "good" | "interesting" | "doubtful" | "bad";
    faint?: boolean;
  }
);

type Marker = (
  | null
  | { type: "label"; label: string }
  | {
    type: (
      | "circle"
      | "cross"
      | "triangle"
      | "square"
      | "point"
      | "loader"
    );
  }
);

window.addEventListener("load", async () => {
  const moveStats = await api.findMoveStats(
    boardClass.Board().hash.value.value,
  );

  console.log(moveStats);

  const markerMap = FillSignMap<Marker>(9, 9, null);
  const ghostStoneMap = FillSignMap<GhostStone>(9, 9, null);

  for (const moveStat of moveStats) {
    if (moveStat.location === null) {
      continue;
    }

    const [x, y] = [moveStat.location.x - 1, moveStat.location.y - 1];

    markerMap[y][x] = {
      type: "label",
      label: moveStat.count.toString(),
    };
  }

  preact.render(
    preact.h(BoundedGoban, {
      maxWidth: 500,
      maxHeight: 500,
      signMap: SignMap(boardClass),
      ghostStoneMap,
      markerMap,
      showCoordinates: true,
    }),
    globalThis.document.body,
  );
});
