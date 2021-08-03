import { Color, default as BoardClass } from "./BoardClass.ts";
import type { Location } from "./entities.ts";

type Move = {
  location: Location | null;
  color: Color;
};

function movesEqual(a: Move, b: Move) {
  if (a.color !== b.color) {
    return false;
  }

  if (a.location === null || b.location === null) {
    return a.location === b.location;
  }

  return (
    a.location.x === b.location.x &&
    a.location.y === b.location.y
  );
}

export default class BoardTree {
  parent: BoardTree | null = null;
  lastMove: { location: Location | null; color: Color } | null = null;
  children: BoardTree[] = [];
  board: BoardClass;

  constructor(width: number, height: number, komi: number) {
    this.board = new BoardClass(width, height, komi);
  }

  play(x: number, y: number, color: Color): BoardTree {
    const move: Move = {
      location: { x, y },
      color,
    };

    for (const child of this.children) {
      if (child.lastMove !== null && movesEqual(child.lastMove, move)) {
        return child;
      }
    }

    const child = new BoardTree(0, 0, 0);
    child.board = this.board.clone();
    child.board.play(x, y, color);
    child.lastMove = { location: { x, y }, color };

    child.parent = this;
    this.children.push(child);

    return child;
  }

  // TODO: Revise underlying BoardClass
  playLocation(location: Location | null, color: Color): BoardTree {
    if (location !== null) {
      return this.play(location.x, location.y, color);
    }

    // FIXME: Code duplication
    const child = new BoardTree(0, 0, 0);
    child.board = this.board.clone();
    child.board.pass(color);
    child.lastMove = { location: null, color };

    child.parent = this;
    this.children.push(child);

    return child;
  }
}
