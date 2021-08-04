import { Location } from "./entities.ts";
import SimpleGameData from "./SimpleGameData.ts";

type Move = SimpleGameData["moves"][0];

// export function canonicalizeMoves(
//   width: number,
//   height: number,
//   moves: Move[],
// ): Move[] {
//   // const
// }

const symmetryNameSet = {
  identity: true,
  rotate90: true,
  rotate180: true,
  rotate270: true,
  flipX: true,
  flipY: true,
  flipDiagonalPositive: true,
  flipDiagonalNegative: true,
};

export type SymmetryName = keyof typeof symmetryNameSet;

export type Symmetry = {
  name: SymmetryName;
  apply: (location: Location) => Location;
  unapply: (location: Location) => Location;
};

const baseSymmetries: Record<SymmetryName, (location: Location) => Location> = {
  identity: ({ x, y }) => ({ x, y }),

  rotate90: ({ x, y }) => ({ x: y, y: -x }),
  rotate180: ({ x, y }) => ({ x: -x, y: -y }),
  rotate270: ({ x, y }) => ({ x: -y, y: x }),

  flipX: ({ x, y }) => ({ x, y: -y }),
  flipY: ({ x, y }) => ({ x: -x, y }),

  flipDiagonalPositive: ({ x, y }) => ({ x: y, y: x }),
  flipDiagonalNegative: ({ x, y }) => ({ x: -y, y: -x }),
};

const rectangularSymmetries: Symmetry[] = [
  {
    name: "identity",
    apply: baseSymmetries.identity,
    unapply: baseSymmetries.identity,
  },
  {
    name: "rotate180",
    apply: baseSymmetries.rotate180,
    unapply: baseSymmetries.rotate180,
  },
  {
    name: "flipX",
    apply: baseSymmetries.flipX,
    unapply: baseSymmetries.flipX,
  },
  {
    name: "flipY",
    apply: baseSymmetries.flipY,
    unapply: baseSymmetries.flipY,
  },
];

const squareSymmetries: Symmetry[] = [
  ...rectangularSymmetries,
  {
    name: "rotate90",
    apply: baseSymmetries.rotate90,
    unapply: baseSymmetries.rotate270,
  },
  {
    name: "rotate270",
    apply: baseSymmetries.rotate270,
    unapply: baseSymmetries.rotate90,
  },
  {
    name: "flipDiagonalPositive",
    apply: baseSymmetries.flipDiagonalPositive,
    unapply: baseSymmetries.flipDiagonalPositive,
  },
  {
    name: "flipDiagonalNegative",
    apply: baseSymmetries.flipDiagonalNegative,
    unapply: baseSymmetries.flipDiagonalNegative,
  },
];

export function Symmetries(width: number, height: number): Symmetry[] {
  const halfWidth = 0.5 * width;
  const halfHeight = 0.5 * height;

  const center = ({ x, y }: Location) => ({
    x: x - halfWidth,
    y: y - halfHeight,
  });

  const uncenter = ({ x, y }: Location) => ({
    x: x + halfWidth,
    y: y + halfHeight,
  });

  const centeredSymmetries = width === height
    ? squareSymmetries
    : rectangularSymmetries;

  return centeredSymmetries.map(({ name, apply, unapply }) => ({
    name,
    apply: (loc: Location) => uncenter(apply(center(loc))),
    unapply: (loc: Location) => uncenter(unapply(center(loc))),
  }));
}
