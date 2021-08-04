export class FailError extends Error {
  constructor(public message = "failed") {
    super(message);
  }
}

export default function fail(msg?: string): never {
  throw new FailError(msg);
}
