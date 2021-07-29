import { BoundedGoban, preact, tb } from "./deps.ts";

import { apiPort } from "../common/constants.ts";
import WebSocketBufferIO from "../common/WebSocketBufferIO.ts";
import Protocol from "../common/Protocol.ts";

const bufferIO = new WebSocketBufferIO(
  new WebSocket(`ws://localhost:${apiPort}/`),
);

const api = tb.Client(bufferIO, Protocol);

const signMap = [
  [0, 0, 1, 0, -1, -1, 1, 0, 0],
  [1, 0, 1, -1, -1, 1, 1, 1, 0],
  [0, 0, 1, -1, 0, 1, -1, -1, 0],
  [1, 1, 1, -1, -1, -1, 1, -1, 0],
  [1, -1, 1, 1, -1, 1, 1, 1, 0],
  [-1, -1, -1, -1, -1, 1, 0, 0, 0],
  [0, -1, -1, 0, -1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, -1, -1, -1, 1],
  [0, 0, 0, 0, 0, 0, 0, -1, 0],
];

window.addEventListener("load", () => {
  preact.render(
    preact.h(BoundedGoban, {
      maxWidth: 500,
      maxHeight: 500,
      signMap,
      showCoordinates: true,
    }),
    (globalThis as any).document.body,
  );
});
