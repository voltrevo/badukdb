import ExplicitAny from "./ExplicitAny.ts";

type AsyncReturnType<Fn> = (
  Fn extends (...args: ExplicitAny[]) => Promise<infer T> ? T : never
);

export default AsyncReturnType;
