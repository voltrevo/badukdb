import { Color } from "./BoardClass.ts";
import { tb } from "./deps.ts";

const Location = tb.Object({
  x: tb.number,
  y: tb.number,
});

export const MoveStat = tb.Object({
  location: tb.Optional(Location),
  color: Color,
  result: tb.number,
  count: tb.number,
  detail: tb.Optional(tb.Array(tb.Object({
    result: tb.number,
    externalId: tb.string,
  }))),
});

export type MoveStat = tb.TypeOf<typeof MoveStat>;

export default tb.Protocol({
  findMoveStats: tb.Method(tb.buffer)(tb.Object({
    moveStats: tb.Array(MoveStat),
    processingTime: tb.number,
  })),
});
