export enum TokenTypes {
  IMPORT = "IMPORT",
  FROM = "FROM",
  SELECT = "SELECT",
  WHERE = "WHERE",
  IDENTIFIER = "IDENTIFIER",
  BINARY_OP = "BINARY_OP",
  STRING = "STRING",
  BOOLEAN = "BOOLEAN",
  NUMBER = "NUMBER",
  PARENTHESES_OPEN = "PARENTHESES_OPEN",
  PARENTHESES_CLOSE = "PARENTHESES_CLOSE",
}

const token = (char: string, type: TokenTypes) => {
  return { type, value: char };
};

export type Token = {
  type: TokenTypes;
  value: string;
};
const invalidTokens = ['"', ";", "{", "}"];
const skipChars = [" ", "\n", "\t", "\r", "\v"];

const binaryOperators = [
  "=",
  "!=",
  "<",
  "<=",
  ">=",
  ">",
  "&",
  "|",
  "+",
  "-",
  "*",
  "/",
  "AND",
  "OR",
];

const reservedWords = [
  "IMPORT",
  "FROM",
  "SELECT",
  "WHERE",
  "TRUE",
  "FALSE",
  "AND",
  "OR",
];

export const tokenize = (input: string): Token[] => {
  const tokens: Token[] = [];
  let text = input.trim().split("");
  let subChars = "";

  while (text.length > 0) {
    if (invalidTokens.includes(text[0])) {
      throw new Error(`Invalid token: ${text[0]}`);
    }

    if (skipChars.includes(text[0])) {
      text.shift();
      continue;
    }

    if (text[0] === "!" && text[1] === "=") {
      tokens.push(token("!=", TokenTypes.BINARY_OP));
      text.splice(0, 2); // Remove both characters
      continue;
    }

    if (text[0] === ">" && text[1] === "=") {
      tokens.push(token(">=", TokenTypes.BINARY_OP));
      text.splice(0, 2);
      continue;
    }

    if (text[0] === "<" && text[1] === "=") {
      tokens.push(token("<=", TokenTypes.BINARY_OP));
      text.splice(0, 2);
      continue;
    }

    if (/[a-zA-Z_]/.test(text[0])) {
      subChars = "";
      while (/[a-zA-Z0-9_]/.test(text[0])) {
        subChars += text.shift();
      }
      if (reservedWords.includes(subChars.toUpperCase())) {
        tokens.push(
          token(
            subChars.toUpperCase(),
            TokenTypes[subChars.toUpperCase() as keyof typeof TokenTypes]
          )
        );
      } else {
        tokens.push(token(subChars, TokenTypes.IDENTIFIER));
      }
      continue;
    }

    if (/[0-9]/.test(text[0])) {
      subChars = "";
      while (/[0-9.]/.test(text[0])) {
        subChars += text.shift();
      }
      tokens.push(token(subChars, TokenTypes.NUMBER));
      continue;
    }

    if (text[0] === "'") {
      text.shift();
      subChars = "";
      while (text[0] !== "'") {
        subChars += text.shift();
      }
      text.shift();
      tokens.push(token(subChars, TokenTypes.STRING));
      continue;
    }

    if (text[0] === "(") {
      tokens.push(token("(", TokenTypes.PARENTHESES_OPEN));
      text.shift();
      continue;
    }

    if (text[0] === ")") {
      tokens.push(token(")", TokenTypes.PARENTHESES_CLOSE));
      text.shift();
      continue;
    }

    if (binaryOperators.includes(text[0])) {
      subChars = text.shift()!;
      tokens.push(token(subChars, TokenTypes.BINARY_OP));
      continue;
    }

    throw new Error(`Unrecognized character: ${text[0]}`);
  }

  return tokens;
};
