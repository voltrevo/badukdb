import { tb } from "./deps.ts";

const Location = tb.Object({
  x: tb.number,
  y: tb.number,
});

export const MoveStat = tb.Object({
  location: tb.Optional(Location),
  count: tb.number,
  externalIds: tb.Array(tb.string),
});

export type MoveStat = tb.TypeOf<typeof MoveStat>;

export default tb.Protocol({
  findMoveStats: tb.Method(tb.buffer)(tb.Object({
    moveStats: tb.Array(MoveStat),
    processingTime: tb.number,
  })),
});
