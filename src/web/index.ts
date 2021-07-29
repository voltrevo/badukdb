import { BoundedGoban, preact } from "./deps.ts";

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
