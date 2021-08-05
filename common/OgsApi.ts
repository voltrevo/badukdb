import { HttpStatus, tb } from "./deps.ts";
import FetchWith429Retries from "./FetchWith429Retries.ts";
import assert from "./helpers/assert.ts";

class OgsApi {
  origin: string;
  fetch = FetchWith429Retries(1000, 3, 81000);

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

    const response = await this.fetch(`${this.origin}${path}`);

    if (response.status === HttpStatus.NotFound) {
      return null;
    }

    if (response.status !== HttpStatus.OK) {
      console.error(response.status, await response.text());
      assert(false, "Expected HTTP OK");
    }

    assert(response.status === HttpStatus.OK, "Expected HTTP OK");

    return await response.text();
  }

  async get<T>(path: string, type: tb.Bicoder<T>): Promise<T> {
    const result = await this.getMaybe(path, type);

    if (result === null) {
      // getMaybe got 404
      assert(false, "Expected HTTP OK");
    }

    return result.value;
  }

  async getMaybe<T>(
    path: string,
    type: tb.Bicoder<T>,
  ): Promise<{ value: T } | null> {
    if (path.startsWith(this.origin)) {
      path = path.slice(this.origin.length);
    }

    assert(path[0] === "/");

    const response = await this.fetch(`${this.origin}${path}`);

    if (response.status === HttpStatus.NotFound) {
      return null;
    }

    assert(response.status === HttpStatus.OK, "Expected HTTP OK");

    const contentType = response.headers.get("content-type") ?? "";
    assert(contentType.startsWith("application/json"));

    const jsonText = await response.text();

    try {
      return { value: tb.JSON.parse(type, jsonText) };
    } catch (error) {
      console.error("unexpected json", jsonText);
      throw error;
    }
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

  async Game(gameId: number): Promise<OgsApi.Game | null> {
    const result = await this.getMaybe(`/api/v1/games/${gameId}/`, OgsApi.Game);
    return result && result.value;
  }

  async *Games(playerId: number): AsyncGenerator<OgsApi.Game> {
    yield* this.getPaginated(`/api/v1/players/${playerId}/games/`, OgsApi.Game);
  }

  async Sgf(gameId: number): Promise<string | null> {
    return await this.getString(`/api/v1/games/${gameId}/sgf/`);
  }
}

// deno-lint-ignore no-namespace
namespace OgsApi {
  export function PaginationResponse<T>(type: tb.Bicoder<T>) {
    return tb.Object({
      count: tb.number,
      next: tb.Optional(tb.string),
      previous: tb.Optional(tb.string),
      results: tb.Array(type),
    });
  }

  export const Player = tb.Union(
    // FIXME: This is clumsy
    tb.Object({
      id: tb.number,
      username: tb.string,
      icon: tb.string,
      ranking: tb.number,
    }),
    tb.Object({
      // id: tb.number,
      username: tb.string,
      // icon: tb.string,
      ranking: tb.number,
    }),
  );

  export const HistoricalPlayer = tb.Object({
    id: tb.number,
    ratings: tb.Object({
      version: tb.number,
      overall: tb.Object({
        rating: tb.number,
        deviation: tb.number,
        volatility: tb.number,
      }),
    }),
    username: tb.string,
    country: tb.string,
    ranking: tb.number, // This is actually LATEST ranking, not historical
    professional: tb.boolean,
    icon: tb.string,
    ui_class: tb.string,
  });

  export const Game = tb.Object({
    // related: tb.Object({
    //   detail: tb.string,
    // }),
    id: tb.number,
    players: tb.Object({
      black: Player,
      white: Player,
    }),
    name: tb.string,
    source: tb.string,
    width: tb.number,
    height: tb.number,
    rules: tb.string,
    ranked: tb.boolean,
    handicap: tb.number,
    komi: tb.string,
    black_lost: tb.boolean,
    white_lost: tb.boolean,
    outcome: tb.string,
    annulled: tb.boolean,
    started: tb.string,
    ended: tb.Optional(tb.string),
    historical_ratings: tb.Object({
      black: HistoricalPlayer,
      white: HistoricalPlayer,
    }),
  });

  export type Game = tb.TypeOf<typeof Game>;
}

export default OgsApi;
