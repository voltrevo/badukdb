const alpha = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function escapeString(input: string) {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/\]/g, "\\]");
}

export function unescapeString(input: string) {
  const result = [];
  let inBackslash = false;

  input = input.replace(/\r/g, "");

  for (let i = 0; i < input.length; i++) {
    if (!inBackslash) {
      if (input[i] !== "\\") result.push(input[i]);
      else if (input[i] === "\\") inBackslash = true;
    } else {
      if (input[i] !== "\n") result.push(input[i]);

      inBackslash = false;
    }
  }

  return result.join("");
}

export function parseDates(input: string) {
  if (
    !input.match(
      /^(\d{4}(-\d{1,2}(-\d{1,2})?)?(\s*,\s*(\d{4}|(\d{4}-)?\d{1,2}(-\d{1,2})?))*)?$/,
    )
  ) {
    return null;
  }

  if (input.trim() === "") return [];

  const dates = input.split(",").map((x) => x.trim().split("-"));

  for (let i = 1; i < dates.length; i++) {
    const date = dates[i];
    const prev = dates[i - 1];

    if (date[0].length !== 4) {
      // No year

      if (date.length === 1 && prev.length === 3) {
        // Add month
        date.unshift(prev[1]);
      }

      // Add year
      date.unshift(prev[0]);
    }
  }

  return dates.map((x) => x.map((y) => +y));
}

export function stringifyDates(dates: number[][]) {
  if (dates.length === 0) return "";

  const datesCopy = [dates[0].slice()];

  for (let i = 1; i < dates.length; i++) {
    const date = dates[i];
    const prev = dates[i - 1];
    let k = 0;

    for (let j = 0; j < date.length; j++) {
      if (date[j] === prev[j] && k === j) k++;
      else break;
    }

    datesCopy.push(date.slice(k));
  }

  return datesCopy
    .map((x) => x.map((y) => (y > 9 ? "" + y : "0" + y)).join("-"))
    .join(",");
}

export function parseVertex(input: string) {
  if (input.length !== 2) return [-1, -1];
  return input.split("").map((x) => alpha.indexOf(x));
}

export function stringifyVertex([x, y]: [number, number]) {
  if (Math.min(x, y) < 0 || Math.max(x, y) >= alpha.length) return "";
  return alpha[x] + alpha[y];
}

export function parseCompressedVertices(input: string) {
  const colon = input.indexOf(":");
  if (colon < 0) return [parseVertex(input)];

  const [x1, y1] = parseVertex(input.slice(0, colon));
  const [x2, y2] = parseVertex(input.slice(colon + 1));
  const vertices = [];

  for (let i = Math.min(x1, x2); i <= Math.max(x1, x2); i++) {
    for (let j = Math.min(y1, y2); j <= Math.max(y1, y2); j++) {
      vertices.push([i, j]);
    }
  }

  return vertices;
}
