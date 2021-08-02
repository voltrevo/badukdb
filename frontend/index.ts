import { BoundedGoban, preact, tb } from "./deps.ts";

import { apiPort } from "../common/constants.ts";
import WebSocketBufferIO from "../common/WebSocketBufferIO.ts";
import Protocol from "../common/Protocol.ts";
import BoardClass from "../common/BoardClass.ts";
import SignMap from "./SignMap.ts";

const bufferIO = new WebSocketBufferIO(
  new WebSocket(`ws://localhost:${apiPort}/`),
);

const boardClass = new BoardClass(9, 9, 5.5);

const api = tb.Client(bufferIO, Protocol);

window.addEventListener("load", () => {
  preact.render(
    preact.h(BoundedGoban, {
      maxWidth: 500,
      maxHeight: 500,
      signMap: SignMap(boardClass),
      showCoordinates: true,
    }),
    (globalThis as any).document.body,
  );
});
