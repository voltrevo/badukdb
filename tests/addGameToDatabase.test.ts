import addGameToDatabase from "../src/addGameToDatabase.ts";
import SimpleGameData from "../src/SimpleGameData.ts";
import SQLiteDatabase from "../src/SQLiteDatabase.ts";
import RawGameRecordExample from "./helpers/RawGameRecordExample.ts";

Deno.test("addGameToDatabase adds example without errors", async () => {
  const db = new SQLiteDatabase();
  const raw = RawGameRecordExample();
  const game = SimpleGameData(raw);

  await addGameToDatabase(db, game);
});
