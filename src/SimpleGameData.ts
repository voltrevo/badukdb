import { Color } from "./BoardClass.ts";
import assert from "./helpers/assert.ts";
import RawGameRecord from "./RawGameRecord.ts";
import parseSgf from "./sgf/parse.ts";

type OutcomeDetail = (
  | { type: "score"; lead: number }
  | { type: "resignation" }
  | { type: "timeout" }
  | { type: "disconnection" }
  | { type: "unknown"; description: string }
);

export default function SimpleGameData(game: RawGameRecord) {
  const metadata = MetadataFromOGS(game.ogs);

  // TODO: handicap moves

  const moves = extractSgfMoves(parseSgf(game.sgf));

  return {
    ...metadata,
    moves,
  };
}

function MetadataFromOGS(ogs: RawGameRecord["ogs"]) {
  return {
    name: ogs.name,
    width: ogs.width,
    height: ogs.height,
    externalId: `ogs:game:${ogs.id}`,
    ranked: ogs.ranked,
    players: {
      black: {
        externalId: `ogs:player:${ogs.players.black.id}`,
        username: ogs.players.black.username,
        rank: ogs.players.black.ranking,
      },
      white: {
        externalId: `ogs:player:${ogs.players.white.id}`,
        username: ogs.players.white.username,
        rank: ogs.players.white.ranking,
      },
    },
    outcome: (() => {
      if (ogs.annulled) {
        return null;
      }

      const winner = ((): Color | null => {
        if (!ogs.black_lost && !ogs.white_lost) {
          return null;
        }

        if (ogs.black_lost && ogs.white_lost) {
          throw new Error("Invalid OGS data: both players lost");
        }

        return ogs.black_lost ? "white" : "black";
      })();

      if (winner === null) {
        return null;
      }

      const detail = ((): OutcomeDetail => {
        if (ogs.outcome === "Resignation") {
          return { type: "resignation" };
        }

        if (ogs.outcome === "Disconnection") {
          return { type: "disconnection" };
        }

        if (ogs.outcome === "Timeout") {
          return { type: "timeout" };
        }

        if (ogs.outcome.endsWith(" points")) {
          const lead = Number(ogs.outcome.slice(0, -(" points").length));

          if (Number.isFinite(lead)) {
            return { type: "score", lead };
          }
        }

        return {
          type: "unknown",
          description: `failed to parse ogs outcome: ${ogs.outcome}`,
        };
      })();

      return { winner, detail };
    })(),
  };
}

function extractSgfMoves(parsedSgf: ReturnType<typeof parseSgf>) {
  if (parsedSgf.length !== 1) {
    throw new Error(`sgf contains ${parsedSgf.length} games`);
  }

  const moves: {
    pos: { x: number; y: number } | null;
    color: Color;
  }[] = [];

  let [node] = parsedSgf;

  while (node.children.length > 0) {
    [node] = node.children;

    const blackMove: string[] | undefined = node.data.B;
    const whiteMove: string[] | undefined = node.data.W;

    if (blackMove !== undefined) {
      assert(whiteMove === undefined);
      assert(blackMove.length === 1);

      moves.push({
        pos: NumericPos(blackMove[0]),
        color: "black",
      });
    } else if (whiteMove !== undefined) {
      assert(blackMove === undefined); // redundant but consistent 🤷‍♂️
      assert(whiteMove.length === 1);

      moves.push({
        pos: NumericPos(whiteMove[0]),
        color: "white",
      });
    } else {
      assert(
        false,
        `sgf node doesn't contain a move: ${JSON.stringify(node.data)}`,
      );
    }
  }

  return moves;
}

function NumericPos(sgfPos: string) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  if (sgfPos === "") {
    return null;
  }

  assert(sgfPos.length === 2);
  assert([...sgfPos].every((c) => alphabet.includes(c)));

  const [x, y] = [...sgfPos].map((c) => alphabet.indexOf(c) + 1);

  return { x, y };
}
