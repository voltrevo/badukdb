import { tb } from "./deps.ts";
import { MoveStat } from "./IDatabase.ts";

export const DbListing = tb.Object({
  name: tb.string,
  count: tb.size,
  start: tb.Object({
    width: tb.size,
    height: tb.size,
    komi: tb.number,
  }),
});

export type DbListing = tb.TypeOf<typeof DbListing>;

export default tb.Protocol({
  listDatabases: tb.Method()(tb.Array(DbListing)),
  findMoveStats: tb.Method(tb.string, tb.buffer)(tb.Object({
    moveStats: tb.Array(MoveStat),
    processingTime: tb.number,
  })),
});
