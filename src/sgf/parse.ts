import Peekable from "./peekable.ts";
import { Token, tokenizeIter } from "./tokenize.ts";
import { unescapeString } from "./helper.ts";

type Node = {
  id: number | null;
  data: Record<string, string[]>;
  parentId: number | null;
  children: Node[];
};

function _parseTokens(
  peekableTokens: Peekable<Token>,
  parentId: number | null,
  getId: () => number,
) {
  let anchor: Node | null = null;
  let node: Node | null = null;
  let property;

  while (!peekableTokens.peek()!.done) {
    const { type, value, row, col } = peekableTokens.peek()!.value!;

    if (type === "parenthesis" && value === "(") break;
    if (type === "parenthesis" && value === ")") {
      return anchor;
    }

    if (type === "semicolon" || node == null) {
      // Prepare new node

      const lastNode: Node | null = node;

      node = {
        id: getId(),
        data: {},
        // FIXME: Why is deno-ts saying lastNode is never below?
        // (Seen by removing cast.)
        parentId: lastNode == null ? parentId : (lastNode as Node).id,
        children: [],
      };

      if (lastNode != null) {
        lastNode.children.push(node);
      } else {
        anchor = node;
      }
    }

    if (type === "semicolon") {
      // Work is already done
    } else if (type === "prop_ident") {
      if (node != null) {
        // Prepare new property

        const identifier = value === value.toUpperCase() ? value : value
          .split("")
          .filter((x) => x.toUpperCase() === x)
          .join("");

        if (identifier !== "") {
          if (!(identifier in node.data)) node.data[identifier] = [];
          property = node.data[identifier];
        } else {
          property = null;
        }
      }
    } else if (type === "c_value_type") {
      if (property != null) {
        property.push(unescapeString(value.slice(1, -1)));
      }
    } else if (type === "invalid") {
      throw new Error(`Unexpected token at ${row + 1}:${col + 1}`);
    } else {
      throw new Error(
        `Unexpected token type '${type}' at ${row + 1}:${col + 1}`,
      );
    }

    peekableTokens.next();
  }

  if (node == null) {
    anchor = node = {
      id: null,
      data: {},
      parentId: null,
      children: [],
    };
  }

  while (!peekableTokens.peek()!.done) {
    const { type, value } = peekableTokens.peek()!.value!;

    if (type === "parenthesis" && value === "(") {
      peekableTokens.next();

      const child = _parseTokens(peekableTokens, node.id, getId);

      if (child != null) {
        node.children.push(child);
      }
    } else if (type === "parenthesis" && value === ")") {
      break;
    }

    peekableTokens.next();
  }

  return anchor;
}

function parseTokens(
  tokens: Generator<Token>,
) {
  const getId = ((id) => () => id++)(0);
  const node = _parseTokens(new Peekable(tokens), null, getId);

  if (node === null) {
    return null;
  }

  return node.id == null ? node.children : [node];
}

export default function parse(contents: string) {
  return parseTokens(tokenizeIter(contents));
}
