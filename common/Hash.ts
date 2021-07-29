import { createHash } from "./deps.ts";

import Nominal from "./Nominal.ts";

export const constructHash = Nominal("Hash")<Uint8Array>();

function Hash(data: Uint8Array) {
  return constructHash(
    new Uint8Array(
      createHash("keccak256").update(data).digest(),
    ),
  );
}

type Hash = ReturnType<typeof Hash>;

export default Hash;
