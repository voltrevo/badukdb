import type { Location } from "./entities.ts";

export default function PrettyLocation(
  width: number,
  location: Location | null,
) {
  if (location === null) {
    return "Pass";
  }

  // Note I is missing
  const letters = "ABCDEFGHJKLMNOPQRSTUVWXYZ";

  // TODO: letters after Z (AA, AB, ...AZ, BA, BB, etc?)

  return `${letters[location.x - 1]}${1 + width - location.y}`;
}
