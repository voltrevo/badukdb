import { tb } from "../../deps.ts";
import IDatabase from "../IDatabase.ts";
import Protocol from "./Protocol.ts";

export default function implement(
  db: IDatabase,
): tb.Implementation<typeof Protocol> {
  return {
    findMoveStats: async (boardHash) => {
    },
  };
}
