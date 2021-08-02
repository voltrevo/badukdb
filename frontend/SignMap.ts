import type BoardClass from "../common/BoardClass.ts";
import Range from "../common/helpers/Range.ts";

export default function SignMap(boardClass: BoardClass) {
  return Range(boardClass.data.height).map(
    (y) =>
      Range(boardClass.data.width).map(
        (x) =>
          ({
            black: 1,
            white: -1,
            empty: 0,
          })[boardClass.read(x + 1, y + 1)],
      ),
  );
}
