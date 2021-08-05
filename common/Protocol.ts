import { tb } from "./deps.ts";
import { MoveStat } from "./IDatabase.ts";

export default tb.Protocol({
  findMoveStats: tb.Method(tb.buffer)(tb.Object({
    moveStats: tb.Array(MoveStat),
    processingTime: tb.number,
  })),
});
