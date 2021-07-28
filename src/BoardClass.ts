import { tb } from "../deps.ts";

import { Board, BoardHash } from "./entities.ts";
import Hash from "./Hash.ts";

const HashlessBoard = tb.Object({
  colorToPlay: tb.Enum("black", "white"),
  offboardPoints: tb.number,
  width: tb.size,
  height: tb.size,
  content: tb.buffer,
});

type HashlessBoard = tb.TypeOf<typeof HashlessBoard>;

export default class BoardClass {
  board: Board;

  constructor(width: number, height: number, komi: number) {
    const hashlessBoard: HashlessBoard = {
      colorToPlay: "black",
      offboardPoints: -komi,
      width,
      height,
      content: new Uint8Array(Math.ceil(width * height / 2)),
    };

    const hash = BoardHash(Hash(HashlessBoard.encode(hashlessBoard)));

    this.board = { hash, ...hashlessBoard };
  }
}
