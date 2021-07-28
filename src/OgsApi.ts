import { HttpStatus, tb } from "../deps.ts";
import assert from "./helpers/assert.ts";

class OgsApi {
  origin: string;

  constructor(origin: string) {
    const originURL = new URL(origin);

    if (
      originURL.pathname !== "/" ||
      originURL.hash !== "" ||
      originURL.search !== ""
    ) {
      throw new Error(`Require plain origin url but received ${origin}`);
    }

    this.origin = originURL.origin;
  }

  async getString(path: string): Promise<string | null> {
    assert(path[0] === "/");

    const response = await fetch(`${this.origin}${path}`);

    if (response.status === HttpStatus.NotFound) {
      return null;
    }

    assert(response.status === HttpStatus.OK, "Expected HTTP OK");

    return await response.text();
  }

  async get<T>(path: string, type: tb.Bicoder<T>): Promise<T> {
    assert(path[0] === "/");

    const response = await fetch(`${this.origin}${path}`);
    assert(response.status === HttpStatus.OK, "Expected HTTP OK");

    const contentType = response.headers.get("content-type") ?? "";
    assert(contentType.startsWith("application/json"));

    const jsonText = await response.text();

    return tb.JSON.parse(type, jsonText);
  }

  async *getPaginated<T>(path: string, type: tb.Bicoder<T>): AsyncGenerator<T> {
    let currentPath: string = path;

    while (true) {
      const response = await this.get(
        currentPath,
        OgsApi.PaginationResponse(type),
      );

      for (const result of response.results) {
        yield result;
      }

      if (response.next === null) {
        break;
      }

      currentPath = response.next;
    }
  }

  async *Games(playerId: number): AsyncGenerator<OgsApi.Game> {
    yield* this.getPaginated(`/v1/players/${playerId}/games/`, OgsApi.Game);
  }

  async Sgf(gameId: number): Promise<string | null> {
    return await this.getString(`/v1/games/${gameId}/sgf/`);
  }
}

// deno-lint-ignore no-namespace
namespace OgsApi {
  export const Game = tb.Object({
    id: tb.number,
  });

  export type Game = tb.TypeOf<typeof Game>;

  export function PaginationResponse<T>(type: tb.Bicoder<T>) {
    return tb.Object({
      count: tb.number,
      next: tb.Optional(tb.string),
      previous: tb.Optional(tb.string),
      results: tb.Array(type),
    });
  }
}

export default OgsApi;
