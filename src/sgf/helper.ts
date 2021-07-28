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
