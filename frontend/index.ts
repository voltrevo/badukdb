import { preact, tb } from "./deps.ts";

import { apiPort } from "../common/constants.ts";
import WebSocketBufferIO from "../common/WebSocketBufferIO.ts";
import Protocol from "../common/Protocol.ts";
import App from "./App.tsx";

const bufferIO = new WebSocketBufferIO(
  new WebSocket(`ws://localhost:${apiPort}/`),
);

const api = tb.Client(bufferIO, Protocol);

window.addEventListener("load", () => {
  preact.render(
    preact.h(App, { api }),
    globalThis.document.body,
  );
});
