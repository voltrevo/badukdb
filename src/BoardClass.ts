import { tb } from "../deps.ts";

import { Board, BoardHash } from "./entities.ts";
import Hash from "./Hash.ts";
import assertExists from "./helpers/assertExists.ts";

const HashlessBoard = tb.Object({
  colorToPlay: tb.Enum("black", "white"),
  offboardPoints: tb.number,
  width: tb.size,
  height: tb.size,
  content: tb.buffer,
});

type HashlessBoard = tb.TypeOf<typeof HashlessBoard>;

const cellStateSet = {
  empty: true,
  black: true,
  white: true,
};

type CellState = keyof typeof cellStateSet;

const cellStates = Object.keys(cellStateSet) as CellState[];

export default class BoardClass {
  data: HashlessBoard;

  constructor(width: number, height: number, komi: number) {
    this.data = {
      colorToPlay: "black",
      offboardPoints: -komi,
      width,
      height,
      content: new Uint8Array(Math.ceil(width * height / 4)),
    };
  }

  Board(): Board {
    const hashInput = HashlessBoard.encode(this.data);
    const hash = BoardHash(Hash(hashInput));

    return { hash, ...this.data };
  }

  read(x: number, y: number): CellState {
    const doubleBitPos = y * this.data.width + x;
    const byte = this.data.content[Math.floor(doubleBitPos / 4)];
    let doubleBit = byte;
    doubleBit >>= 2 * (doubleBitPos % 4);
    doubleBit = doubleBit % 4;

    return assertExists(cellStates[doubleBit]);
  }

  write(x: number, y: number, state: CellState) {
    const doubleBitPos = y * this.data.width + x;
    const doubleBit = cellStates.indexOf(state);

    const contentIndex = Math.floor(doubleBitPos / 4);
    let byte = this.data.content[contentIndex];

    const bitOffset = 2 * (doubleBitPos % 4);
    const mask = 0b11 << bitOffset;

    // Clear this location
    byte = byte & (~mask);

    // Add new state
    byte = byte | (doubleBit << bitOffset);

    this.data.content[contentIndex] = byte;
  }
}
