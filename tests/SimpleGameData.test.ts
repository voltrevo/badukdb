import { assertEquals } from "./deps.ts";

import SimpleGameData from "../common/SimpleGameData.ts";
import RawGameRecordExample from "./helpers/RawGameRecordExample.ts";

Deno.test("SimpleGameData example", () => {
  const raw = RawGameRecordExample();
  const simpleGameData = SimpleGameData(raw);

  assertEquals(simpleGameData, {
    name: "Friendly Match",
    width: 13,
    height: 13,
    externalId: "ogs:game:28073181",
    ranked: true,
    komi: 0.5,
    players: {
      black: {
        externalId: "ogs:player:630242",
        username: "voltrevo",
        rank: 22.77358926085324,
      },
      white: {
        externalId: "ogs:player:496781",
        username: "Play like DD",
        rank: 17.48806770555165,
      },
    },
    outcome: { winner: "black", detail: { type: "score", lead: 30.5 } },
    moves: [
      { location: { x: 10, y: 4 }, color: "white" },
      { location: { x: 4, y: 11 }, color: "black" },
      { location: { x: 9, y: 11 }, color: "white" },
      { location: { x: 10, y: 10 }, color: "black" },
      { location: { x: 10, y: 11 }, color: "white" },
      { location: { x: 11, y: 11 }, color: "black" },
      { location: { x: 11, y: 12 }, color: "white" },
      { location: { x: 11, y: 10 }, color: "black" },
      { location: { x: 12, y: 12 }, color: "white" },
      { location: { x: 12, y: 11 }, color: "black" },
      { location: { x: 10, y: 9 }, color: "white" },
      { location: { x: 9, y: 10 }, color: "black" },
      { location: { x: 9, y: 9 }, color: "white" },
      { location: { x: 8, y: 10 }, color: "black" },
      { location: { x: 8, y: 11 }, color: "white" },
      { location: { x: 10, y: 8 }, color: "black" },
      { location: { x: 11, y: 9 }, color: "white" },
      { location: { x: 11, y: 8 }, color: "black" },
      { location: { x: 9, y: 8 }, color: "white" },
      { location: { x: 12, y: 9 }, color: "black" },
      { location: { x: 9, y: 7 }, color: "white" },
      { location: { x: 9, y: 3 }, color: "black" },
      { location: { x: 10, y: 3 }, color: "white" },
      { location: { x: 9, y: 4 }, color: "black" },
      { location: { x: 9, y: 5 }, color: "white" },
      { location: { x: 10, y: 6 }, color: "black" },
      { location: { x: 10, y: 7 }, color: "white" },
      { location: { x: 11, y: 7 }, color: "black" },
      { location: { x: 9, y: 6 }, color: "white" },
      { location: { x: 10, y: 5 }, color: "black" },
      { location: { x: 11, y: 4 }, color: "white" },
      { location: { x: 11, y: 5 }, color: "black" },
      { location: { x: 12, y: 6 }, color: "white" },
      { location: { x: 11, y: 6 }, color: "black" },
      { location: { x: 12, y: 5 }, color: "white" },
      { location: { x: 12, y: 8 }, color: "black" },
      { location: { x: 12, y: 7 }, color: "white" },
      { location: { x: 10, y: 2 }, color: "black" },
      { location: { x: 11, y: 2 }, color: "white" },
      { location: { x: 11, y: 1 }, color: "black" },
      { location: { x: 9, y: 2 }, color: "white" },
      { location: { x: 10, y: 1 }, color: "black" },
      { location: { x: 9, y: 1 }, color: "white" },
      { location: { x: 12, y: 4 }, color: "black" },
      { location: { x: 12, y: 3 }, color: "white" },
      { location: { x: 11, y: 3 }, color: "black" },
      { location: { x: 7, y: 10 }, color: "white" },
      { location: { x: 8, y: 2 }, color: "black" },
      { location: { x: 8, y: 9 }, color: "white" },
      { location: { x: 7, y: 6 }, color: "black" },
      { location: { x: 7, y: 7 }, color: "white" },
      { location: { x: 6, y: 7 }, color: "black" },
      { location: { x: 7, y: 8 }, color: "white" },
      { location: { x: 6, y: 8 }, color: "black" },
      { location: { x: 6, y: 9 }, color: "white" },
      { location: { x: 5, y: 10 }, color: "black" },
      { location: { x: 6, y: 11 }, color: "white" },
      { location: { x: 6, y: 10 }, color: "black" },
      { location: { x: 5, y: 11 }, color: "white" },
      { location: { x: 5, y: 9 }, color: "black" },
      { location: { x: 7, y: 9 }, color: "white" },
      { location: { x: 3, y: 7 }, color: "black" },
      { location: { x: 8, y: 6 }, color: "white" },
      { location: { x: 7, y: 5 }, color: "black" },
      { location: { x: 8, y: 5 }, color: "white" },
      { location: { x: 8, y: 4 }, color: "black" },
      { location: { x: 7, y: 4 }, color: "white" },
      { location: { x: 6, y: 4 }, color: "black" },
      { location: { x: 7, y: 3 }, color: "white" },
      { location: { x: 6, y: 3 }, color: "black" },
      { location: { x: 6, y: 6 }, color: "white" },
      { location: { x: 6, y: 5 }, color: "black" },
      { location: { x: 5, y: 6 }, color: "white" },
      { location: { x: 4, y: 6 }, color: "black" },
      { location: { x: 5, y: 8 }, color: "white" },
      { location: { x: 4, y: 8 }, color: "black" },
      { location: { x: 5, y: 7 }, color: "white" },
      { location: { x: 4, y: 7 }, color: "black" },
      { location: { x: 5, y: 5 }, color: "white" },
      { location: { x: 5, y: 12 }, color: "black" },
      { location: { x: 6, y: 12 }, color: "white" },
      { location: { x: 4, y: 12 }, color: "black" },
      { location: { x: 6, y: 13 }, color: "white" },
      { location: { x: 12, y: 2 }, color: "black" },
      { location: { x: 4, y: 5 }, color: "white" },
      { location: { x: 3, y: 5 }, color: "black" },
      { location: { x: 5, y: 4 }, color: "white" },
      { location: { x: 5, y: 3 }, color: "black" },
      { location: { x: 4, y: 3 }, color: "white" },
      { location: { x: 3, y: 4 }, color: "black" },
      { location: { x: 6, y: 2 }, color: "white" },
      { location: { x: 5, y: 2 }, color: "black" },
      { location: { x: 4, y: 2 }, color: "white" },
      { location: { x: 7, y: 2 }, color: "black" },
      { location: { x: 5, y: 1 }, color: "white" },
      { location: { x: 3, y: 3 }, color: "black" },
      { location: { x: 3, y: 2 }, color: "white" },
      { location: { x: 2, y: 2 }, color: "black" },
      { location: { x: 2, y: 1 }, color: "white" },
      { location: { x: 1, y: 2 }, color: "black" },
      { location: { x: 3, y: 1 }, color: "white" },
      { location: { x: 5, y: 13 }, color: "black" },
      { location: { x: 4, y: 10 }, color: "white" },
      { location: { x: 4, y: 9 }, color: "black" },
      { location: { x: 3, y: 10 }, color: "white" },
      { location: { x: 3, y: 11 }, color: "black" },
      { location: { x: 2, y: 11 }, color: "white" },
      { location: { x: 2, y: 10 }, color: "black" },
      { location: { x: 3, y: 12 }, color: "white" },
      { location: { x: 3, y: 9 }, color: "black" },
      { location: { x: 4, y: 13 }, color: "white" },
      { location: { x: 3, y: 13 }, color: "black" },
      { location: { x: 2, y: 12 }, color: "white" },
      { location: null, color: "black" },
      { location: { x: 2, y: 13 }, color: "white" },
      { location: { x: 1, y: 11 }, color: "black" },
      { location: { x: 4, y: 13 }, color: "white" },
      { location: { x: 1, y: 12 }, color: "black" },
      { location: { x: 1, y: 9 }, color: "white" },
      { location: { x: 3, y: 13 }, color: "black" },
      { location: { x: 2, y: 9 }, color: "white" },
      { location: { x: 1, y: 13 }, color: "black" },
      { location: { x: 2, y: 7 }, color: "white" },
      { location: { x: 2, y: 8 }, color: "black" },
      { location: { x: 1, y: 8 }, color: "white" },
      { location: { x: 2, y: 6 }, color: "black" },
      { location: { x: 3, y: 8 }, color: "white" },
      { location: { x: 1, y: 10 }, color: "black" },
      { location: { x: 1, y: 6 }, color: "white" },
      { location: { x: 1, y: 5 }, color: "black" },
      { location: { x: 1, y: 7 }, color: "white" },
      { location: { x: 2, y: 8 }, color: "black" },
      { location: { x: 13, y: 12 }, color: "white" },
      { location: { x: 13, y: 11 }, color: "black" },
      { location: { x: 1, y: 1 }, color: "white" },
      { location: { x: 2, y: 3 }, color: "black" },
      { location: null, color: "white" },
      { location: { x: 7, y: 1 }, color: "black" },
      { location: { x: 8, y: 3 }, color: "white" },
      { location: { x: 8, y: 1 }, color: "black" },
      { location: { x: 6, y: 1 }, color: "white" },
      { location: null, color: "black" },
      { location: null, color: "white" },
    ],
  });
});
