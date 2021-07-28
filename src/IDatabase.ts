import { createHash } from "../deps.ts";

import Nominal from "./Nominal.ts";

const Id = Nominal("Id")<Uint8Array>();
type Id = ReturnType<typeof Id>;

function Hash(data: Uint8Array) {
  return Nominal("Hash")()(
    new Uint8Array(
      createHash("keccak256").update(data).digest(),
    ),
  );
}

type Hash = ReturnType<typeof Hash>;

function RandomId() {
  return Id(crypto.getRandomValues(new Uint8Array(32)));
}

const GameId = Nominal("GameId")<Id>();
type GameId = ReturnType<typeof GameId>;

const PlayerId = Nominal("PlayerId")<Id>();
type PlayerId = ReturnType<typeof PlayerId>;

export type Game = {
  id: GameId;
  black: PlayerId;
  white: PlayerId;
};

type IDatabase = {};

export default IDatabase;
