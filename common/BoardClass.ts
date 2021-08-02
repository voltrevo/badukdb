import { tb } from "./deps.ts";

import { Board, BoardHash } from "./entities.ts";
import Hash from "./Hash.ts";
import assert from "./helpers/assert.ts";
import assertExists from "./helpers/assertExists.ts";

export const Color = tb.Enum("black", "white");
export type Color = tb.TypeOf<typeof Color>;

const HashlessBoard = tb.Object({
  colorToPlay: Color,
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

  clone(): BoardClass {
    const board = new BoardClass(0, 0, 0);
    board.data = { ...this.data };
    return board;
  }

  IndexAndShift(x: number, y: number) {
    this.assertBounds(x, y);

    const doubleBitPos = (y - 1) * this.data.width + (x - 1);

    return {
      index: Math.floor(doubleBitPos / 4),
      shift: 2 * (doubleBitPos % 4),
    };
  }

  checkBounds(x: number, y: number) {
    return (
      (1 <= x && x <= this.data.width) &&
      (1 <= y && y <= this.data.height)
    );
  }

  assertBounds(x: number, y: number) {
    assert(
      this.checkBounds(x, y),
      [
        `(${x}, ${y}) is out of bounds on`,
        `${this.data.width}x${this.data.height} board`,
      ].join(" "),
    );
  }

  read(x: number, y: number): CellState {
    const { index, shift } = this.IndexAndShift(x, y);
    const byte = this.data.content[index];
    let doubleBit = byte;
    doubleBit >>= shift;
    doubleBit = doubleBit % 4;

    return assertExists(cellStates[doubleBit]);
  }

  write(x: number, y: number, state: CellState) {
    const { index, shift } = this.IndexAndShift(x, y);

    const doubleBit = cellStates.indexOf(state);

    let byte = this.data.content[index];
    const mask = 0b11 << shift;

    // Clear this location
    byte = byte & (~mask);

    // Add new state
    byte = byte | (doubleBit << shift);

    this.data.content[index] = byte;
  }

  pass(color: Color) {
    this.data.colorToPlay = color === "black" ? "white" : "black";
  }

  *IterateAdjacents(x: number, y: number): Generator<{ x: number; y: number }> {
    const candidates = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];

    for (const candidate of candidates) {
      if (this.checkBounds(candidate.x, candidate.y)) {
        yield candidate;
      }
    }
  }

  *IterateRegion(
    x: number,
    y: number,
  ): Generator<{ x: number; y: number }> {
    const cellState = this.read(x, y);

    yield { x, y };

    const uncheckedPoints = [{ x, y }];
    const checkedPoints = new Set<string>();

    while (true) {
      const point = uncheckedPoints.shift();

      if (point === undefined) {
        break;
      }

      checkedPoints.add(`${point.x},${point.y}`);

      for (const adj of this.IterateAdjacents(point.x, point.y)) {
        if (
          this.read(adj.x, adj.y) !== cellState ||
          checkedPoints.has(`${adj.x},${adj.y}`)
        ) {
          continue;
        }

        yield adj;
        uncheckedPoints.push(adj);
      }
    }
  }

  *IterateLiberties(x: number, y: number): Generator<{ x: number; y: number }> {
    const cellState = this.read(x, y);
    assert(cellState === "black" || cellState === "white");

    const reported = new Set<string>();

    for (const point of this.IterateRegion(x, y)) {
      for (const adj of this.IterateAdjacents(point.x, point.y)) {
        if (this.read(adj.x, adj.y) !== "empty") {
          continue;
        }

        const adjStr = `${adj.x},${adj.y}`;

        if (reported.has(adjStr)) {
          continue;
        }

        yield adj;
        reported.add(adjStr);
      }
    }
  }

  isCaptured(x: number, y: number): boolean {
    for (const _liberty of this.IterateLiberties(x, y)) {
      return false;
    }

    return true;
  }

  capture(x: number, y: number) {
    const color = this.read(x, y);
    assert(color !== "empty");

    const pointDelta = color === "white" ? 1 : -1;

    for (const point of this.IterateRegion(x, y)) {
      this.write(point.x, point.y, "empty");
      this.data.offboardPoints += pointDelta;
    }
  }

  play(x: number, y: number, color: Color) {
    this.write(x, y, color);
    const opponentColor = BoardClass.OpponentColor(color);

    for (const adj of this.IterateAdjacents(x, y)) {
      if (this.read(adj.x, adj.y) !== opponentColor) {
        continue;
      }

      if (!this.isCaptured(adj.x, adj.y)) {
        continue;
      }

      this.capture(adj.x, adj.y);
    }

    if (this.isCaptured(x, y)) {
      this.capture(x, y);
    }

    this.data.colorToPlay = opponentColor;
  }

  static OpponentColor(color: Color): Color {
    return color === "black" ? "white" : "black";
  }

  PrettyString(): string {
    let output = "";

    for (let y = 1; y <= this.data.height; y++) {
      for (let x = 1; x <= this.data.width; x++) {
        output += {
          black: " #",
          white: " 0",
          empty: "  ",
        }[this.read(x, y)];
      }

      if (y !== this.data.height) {
        output += "\n";
      }
    }

    return output;
  }
}
