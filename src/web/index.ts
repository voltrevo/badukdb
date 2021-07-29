import { Goban, preact } from "./deps.ts";

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
    preact.h(Goban, { vertexSize: 24, signMap }),
    (globalThis as any).document.body,
  );
});
