import { BoundedGoban, preact, tb } from "./deps.ts";

import { apiPort } from "../common/constants.ts";
import WebSocketBufferIO from "../common/WebSocketBufferIO.ts";
import Protocol from "../common/Protocol.ts";
import BoardClass from "../common/BoardClass.ts";
import { default as SignMap, FillSignMap } from "./SignMap.ts";
import SignFromColor from "./SignFromColor.ts";

const bufferIO = new WebSocketBufferIO(
  new WebSocket(`ws://localhost:${apiPort}/`),
);

const boardClass = new BoardClass(9, 9, 5.5);

const api = tb.Client(bufferIO, Protocol);

type GhostStone = {
  sign: -1 | 0 | 1;
  type?: "good" | "interesting" | "doubtful" | "bad";
  faint?: boolean;
};

window.addEventListener("load", async () => {
  const moveStats = await api.findMoveStats(
    boardClass.Board().hash.value.value,
  );

  console.log(moveStats);

  const ghostStoneMap = FillSignMap<GhostStone>(9, 9, { sign: 0 });

  for (const moveStat of moveStats) {
    if (moveStat.location === null) {
      continue;
    }

    ghostStoneMap[moveStat.location.y - 1][moveStat.location.x - 1] = {
      sign: SignFromColor(boardClass.data.colorToPlay),
    };
  }

  preact.render(
    preact.h(BoundedGoban, {
      maxWidth: 500,
      maxHeight: 500,
      signMap: SignMap(boardClass),
      ghostStoneMap,
      showCoordinates: true,
    }),
    globalThis.document.body,
  );
});
