import { tb } from "../deps.ts";
import OgsApi from "./OgsApi.ts";

const RawGameRecord = tb.Object({
  ogs: OgsApi.Game,
  sgf: tb.string,
});

type RawGameRecord = tb.TypeOf<typeof RawGameRecord>;

export default RawGameRecord;
