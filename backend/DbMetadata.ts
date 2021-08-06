import { tb } from "./deps.ts";

const DbMetadata = tb.Object({
  name: tb.string,
  count: tb.size,
  filename: tb.string,
  start: tb.Object({
    width: tb.size,
    height: tb.size,
    komi: tb.number,
  }),
});

type DbMetadata = tb.TypeOf<typeof DbMetadata>;

export default DbMetadata;
