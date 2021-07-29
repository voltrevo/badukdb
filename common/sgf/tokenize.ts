import { doken } from "./deps.ts";

// const iconv = require("./iconv-lite");

const _tokenize = doken.createTokenizer({
  rules: [
    doken.regexRule("_whitespace", /\s+/y, { lineBreaks: true }),
    doken.regexRule("parenthesis", /(\(|\))/y),
    doken.regexRule("semicolon", /;/y),
    doken.regexRule("prop_ident", /[A-Za-z]+/y),
    doken.regexRule("c_value_type", /\[([^\\\]]|\\[^])*\]/y, {
      lineBreaks: true,
    }),
    {
      type: "invalid",
      match: (_input, _position) => ({ length: 1 }),
    },
  ],
});

type ExtractIterableIteratorType<It> = (
  It extends IterableIterator<infer T> ? T : never
);

export type Token = ExtractIterableIteratorType<ReturnType<typeof _tokenize>>;

export function* tokenizeIter(contents: string) {
  for (const token of _tokenize(contents)) {
    // TODO: What is the idea behind the next line?
    delete (token as any).length;

    yield token;
  }
}

export function tokenize(contents: string) {
  return [...tokenizeIter(contents)];
}
