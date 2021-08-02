import type { Color } from "../common/BoardClass.ts";

type Sign = -1 | 0 | 1;

export default function SignFromColor(color: Color): Sign {
  return {
    black: 1 as const,
    white: -1 as const,
    empty: 0 as const,
  }[color];
}
