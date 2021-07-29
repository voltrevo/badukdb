import { HttpStatus } from "./deps.ts";

type FetchFn = (url: string, options?: RequestInit) => Promise<Response>;

export default function FetchWith429Retries(
  firstBackoff: number,
  backoffMultiplier: number,
  maxBackoff: number,
): FetchFn {
  return async (url, init) => {
    let backoff = firstBackoff;

    while (true) {
      const response = await fetch(url, init);

      if (
        response.status !== HttpStatus.TooManyRequests ||
        backoff > maxBackoff
      ) {
        return response;
      }

      console.log(`${url}: received 429, backing off for ${backoff}ms`);

      await new Promise((resolve) => setTimeout(resolve, backoff));
      backoff *= backoffMultiplier;
    }
  };
}
