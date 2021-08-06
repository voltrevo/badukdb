import BoardClass, { Color } from "./BoardClass.ts";
import { canonicalizeMoves } from "./canonicalization.ts";
import { GameId, Move, Player, PlayerId } from "./entities.ts";
import assert from "./helpers/assert.ts";
import { RandomId } from "./Id.ts";
import IDatabase from "./IDatabase.ts";
import SimpleGameData from "./SimpleGameData.ts";

export default async function addGameToDatabase(
  db: IDatabase,
  game: SimpleGameData,
) {
  assert(game.outcome !== null);

  const promises: Promise<unknown>[] = [];

  promises.push(db.beginTransaction());

  const [blackPlayer, whitePlayer] = await Promise.all([
    ensurePlayer(db, game.players.black.externalId),
    ensurePlayer(db, game.players.white.externalId),
  ]);

  const boardClass = new BoardClass(game.width, game.height, game.komi);
  const gameId = GameId(RandomId());

  promises.push(
    db.insertGame({
      id: gameId,
      black: blackPlayer.id,
      white: whitePlayer.id,
      startBoard: boardClass.Board().hash,

      // TODO: ties
      result: game.outcome.winner === "black" ? 1 : 0,
    }),
  );

  const moves = canonicalizeMoves(game.width, game.height, game.moves);

  for (const [i, gameMove] of Object.entries(moves)) {
    const board = boardClass.Board();

    const move: Move = {
      game: gameId,
      number: Number(i) + 1,
      board: board.hash,
      location: gameMove.location,
      color: gameMove.color,
      player: gameMove.color === "black" ? blackPlayer.id : whitePlayer.id,
      playerDisplay: PlayerDisplay(game.players[gameMove.color]),
      gameResult: game.outcome.winner === "black" ? 1 : 0,
    };

    promises.push(
      db.insertBoard(board),
      db.insertMove(move),
    );

    if (gameMove.location === null) {
      boardClass.pass(gameMove.color);
    } else {
      boardClass.play(gameMove.location.x, gameMove.location.y, gameMove.color);
    }
  }

  // Include the final board position, even though no moves reference it
  promises.push(db.insertBoard(boardClass.Board()));

  promises.push(db.commit());

  await Promise.all(promises);
}

async function ensurePlayer(
  db: IDatabase,
  externalId: string,
): Promise<Player> {
  let player = await db.lookupPlayerByExternalId(externalId);

  if (player === null) {
    player = { id: PlayerId(RandomId()), externalId };
    await db.insertPlayer(player);
  }

  return player;
}

function PlayerDisplay(player: SimpleGameData["players"][Color]) {
  const kyuRank = 30 - player.rank;
  const danRank = player.rank - 29;

  const rankStr = kyuRank > 0
    ? `${Math.ceil(kyuRank)}k`
    : `${Math.floor(danRank)}d`;

  return `${player.username} [${rankStr}]`;
}
