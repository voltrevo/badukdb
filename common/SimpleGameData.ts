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

function SimpleGameData(game: RawGameRecord) {
  const metadata = MetadataFromOGS(game.ogs);

  // TODO: handicap moves

  const moves = extractSgfMoves(parseSgf(game.sgf));

  return {
    ...metadata,
    moves,
  };
}

type SimpleGameData = ReturnType<typeof SimpleGameData>;

function MetadataFromOGS(ogs: RawGameRecord["ogs"]) {
  const blackId = "id" in ogs.players.black ? ogs.players.black.id : "unknown";
  const whiteId = "id" in ogs.players.white ? ogs.players.white.id : "unknown";

  return {
    name: ogs.name,
    width: ogs.width,
    height: ogs.height,
    externalId: `ogs:game:${ogs.id}`,
    ranked: ogs.ranked,
    komi: Number(ogs.komi),
    players: {
      black: {
        externalId: `ogs:player:${blackId}`,
        username: ogs.historical_ratings.black.username,
        rank: RankFromRating(
          ogs.historical_ratings.black.ratings.overall.rating,
        ),
      },
      white: {
        externalId: `ogs:player:${whiteId}`,
        username: ogs.players.white.username,
        rank: RankFromRating(
          ogs.historical_ratings.white.ratings.overall.rating,
        ),
      },
    },
    outcome: (() => {
      if (ogs.annulled) {
        return null;
      }

      if (ogs.ended === null) {
        return null; // Otherwise OGS records black_lost and white_lost!
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
        // TODO: Distinguish ties?
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
    location: { x: number; y: number } | null;
    color: Color;
  }[] = [];

  let [node] = parsedSgf;

  for (const handicapMove of node.data.AB ?? []) {
    moves.push({
      location: Location(handicapMove),
      color: "black",
    });
  }

  while (node.children.length > 0) {
    [node] = node.children;

    const blackMove: string[] | undefined = node.data.B;
    const whiteMove: string[] | undefined = node.data.W;

    if (blackMove !== undefined) {
      assert(whiteMove === undefined);
      assert(blackMove.length === 1);

      moves.push({
        location: Location(blackMove[0]),
        color: "black",
      });
    } else if (whiteMove !== undefined) {
      assert(blackMove === undefined); // redundant but consistent 🤷‍♂️
      assert(whiteMove.length === 1);

      moves.push({
        location: Location(whiteMove[0]),
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

function Location(sgfLocation: string) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";

  if (sgfLocation === "") {
    return null;
  }

  assert(sgfLocation.length === 2);
  assert([...sgfLocation].every((c) => alphabet.includes(c)));

  const [x, y] = [...sgfLocation].map((c) => alphabet.indexOf(c) + 1);

  return { x, y };
}

function RankFromRating(rating: number) {
  return Math.log(rating / 525) * 23.15;
}

export default SimpleGameData;
