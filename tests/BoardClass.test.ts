import BoardClass from "../src/BoardClass.ts";
import SimpleGameData from "../src/SimpleGameData.ts";
import { assertEquals } from "./deps.ts";
import RawGameRecordExample from "./helpers/RawGameRecordExample.ts";

Deno.test("correctly predicts final board position", () => {
  const game = SimpleGameData(RawGameRecordExample());

  const board = new BoardClass(game.width, game.height, game.komi);

  for (const move of game.moves) {
    if (move.location === null) {
      board.pass(move.color);
    } else {
      board.play(move.location.x, move.location.y, move.color);
    }
  }

  assertEquals(
    board.PrettyString(),
    [
      " 0 0 0   0 0 # #   # #    ",
      " # # 0 0   0 # #   #   #  ",
      "   # # 0     0 0 #   # 0  ",
      "     #   0   0 # #     #  ",
      " #   # 0 0     0 0 # # 0  ",
      "   #   # 0 0   0 0 # # 0  ",
      "     # # 0   0   0 0 # 0  ",
      "   #   # 0   0   0 # # #  ",
      "     # # # 0 0 0 0 0 0 #  ",
      " # #     # # 0 # # # #    ",
      " #   # # 0 0   0 0 0 # # #",
      " #     # # 0         0 0 0",
      " #   #   # 0              ",
    ].join("\n"),
  );
});
