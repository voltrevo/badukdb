import Nominal from "./Nominal.ts";

const Id = Nominal("Id")<Uint8Array>();
type Id = ReturnType<typeof Id>;

export function RandomId() {
  return Id(crypto.getRandomValues(new Uint8Array(32)));
}

export default Id;
