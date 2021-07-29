import { createHash } from "../deps.ts";

import basex from "./basex.ts";
import buffersEqual from "./buffersEqual.ts";
import assertExists from "./assertExists.ts";

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const bs58 = basex(ALPHABET);

// deno-lint-ignore no-namespace
namespace bs58check {
  function sha256(buffer: Uint8Array): Uint8Array {
    return new Uint8Array(createHash("sha256").update(buffer).digest());
  }

  export function encode(buffer: Uint8Array): string {
    const checksum = sha256(sha256(buffer)).slice(0, 4);
    const bufferCheck = new Uint8Array(buffer.byteLength + 4);
    bufferCheck.set(buffer);
    bufferCheck.set(checksum, buffer.byteLength);

    return bs58.encode(bufferCheck);
  }

  export function decodeSoft(encoded: string): Uint8Array | null {
    const bufferCheck = bs58.decode(encoded);

    if (bufferCheck.byteLength < 4) {
      return null;
    }

    const buffer = bufferCheck.slice(0, bufferCheck.byteLength - 4);
    const checksum = bufferCheck.slice(bufferCheck.byteLength - 4);

    const checksumRepeat = sha256(sha256(buffer)).slice(0, 4);

    if (!buffersEqual(checksum, checksumRepeat)) {
      return null;
    }

    return buffer;
  }

  export function decode(encoded: string): Uint8Array {
    return assertExists(decodeSoft(encoded), "Checksum mismatch");
  }
}

export default bs58check;
