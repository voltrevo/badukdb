import { tb } from "../../deps.ts";

const Location = tb.Object({
  x: tb.number,
  y: tb.number,
});

const MoveStat = tb.Object({
  location: Location,
  count: tb.number,
});

export default tb.Protocol({
  findMoveStats: tb.Method(tb.buffer)(tb.Array(MoveStat)),
});
