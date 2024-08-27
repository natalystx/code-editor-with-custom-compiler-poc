import { Token, TokenTypes } from "./lexer";

class ParserError extends Error {
  token: Token;

  constructor(message: string, token: Token) {
    super(message);
    this.name = "ParserError";
    this.token = token;
  }
}

export enum ASTNodeTypes {
  IMPORT_STATEMENT = "IMPORT_STATEMENT",
  SELECT_STATEMENT = "SELECT_STATEMENT",
  WHERE_CLAUSE = "WHERE_CLAUSE",
  BINARY_EXPRESSION = "BINARY_EXPRESSION",
  IDENTIFIER = "IDENTIFIER",
  STRING_LITERAL = "STRING_LITERAL",
  NUMBER_LITERAL = "NUMBER_LITERAL",
  BOOLEAN_LITERAL = "BOOLEAN_LITERAL",
}

export type ASTNode = {
  type: ASTNodeTypes;
  value?: string | number | boolean;
  left?: ASTNode;
  right?: ASTNode;
  condition?: ASTNode;
  consequent?: ASTNode;
};
export const parse = (tokens: Token[]): ASTNode[] => {
  const ast: ASTNode[] = [];
  let current = 0;

  try {
    const parseExpression = (): ASTNode => {
      let token = tokens[current];

      if (!token) {
        throw new Error("Unexpected end of input");
      }

      if (token.type === TokenTypes.NUMBER) {
        current++;
        return {
          type: ASTNodeTypes.NUMBER_LITERAL,
          value: parseFloat(token.value),
        };
      }

      if (token.type === TokenTypes.STRING) {
        current++;
        return {
          type: ASTNodeTypes.STRING_LITERAL,
          value: token.value,
        };
      }

      if (token.type === TokenTypes.BOOLEAN) {
        current++;
        return {
          type: ASTNodeTypes.BOOLEAN_LITERAL,
          value: token.value === "TRUE",
        };
      }

      if (token.type === TokenTypes.IDENTIFIER) {
        current++;
        return {
          type: ASTNodeTypes.IDENTIFIER,
          value: token.value,
        };
      }

      if (token.type === TokenTypes.PARENTHESES_OPEN) {
        current++;
        const expression = parseBinaryExpression();
        if (tokens[current].type !== TokenTypes.PARENTHESES_CLOSE) {
          throw new ParserError(
            "Expected closing parenthesis",
            tokens[current]
          );
        }
        current++;
        return expression;
      }

      throw new ParserError(`Unexpected token: ${token.value}`, token);
    };

    const parseBinaryExpression = (): ASTNode => {
      let left = parseExpression();

      while (
        tokens[current] &&
        (tokens[current].type === TokenTypes.BINARY_OP ||
          tokens[current].value === "AND" ||
          tokens[current].value === "OR")
      ) {
        const operator = tokens[current];

        current++;
        const right = parseExpression();

        left = {
          type: ASTNodeTypes.BINARY_EXPRESSION,
          left,
          right,
          value: operator.value,
        };
      }

      return left;
    };

    const parseWhereClause = (): ASTNode => {
      if (tokens[current].type !== TokenTypes.WHERE) {
        throw new ParserError("Expected WHERE keyword", tokens[current]);
      }
      current++;

      const condition = parseBinaryExpression();

      return {
        type: ASTNodeTypes.WHERE_CLAUSE,
        condition,
      };
    };

    const parseSelectStatement = (): ASTNode => {
      if (tokens[current].type !== TokenTypes.SELECT) {
        throw new ParserError("Expected SELECT keyword", tokens[current]);
      }
      current++;

      if (tokens[current].value !== "*") {
        throw new ParserError("Expected '*' after SELECT", tokens[current]);
      }
      current++;

      if (tokens[current].type !== TokenTypes.FROM) {
        throw new ParserError("Expected FROM keyword", tokens[current]);
      }
      current++;

      const source = parseExpression();

      const selectNode: ASTNode = {
        type: ASTNodeTypes.SELECT_STATEMENT,
        consequent: source,
      };

      if (tokens[current] && tokens[current].type === TokenTypes.WHERE) {
        selectNode.condition = parseWhereClause();
      }

      return selectNode;
    };

    const parseImportStatement = (): ASTNode => {
      if (tokens[current].type !== TokenTypes.IMPORT) {
        throw new ParserError("Expected IMPORT keyword", tokens[current]);
      }
      current++;

      const identifier = parseExpression();

      if (tokens[current].type !== TokenTypes.FROM) {
        throw new ParserError("Expected FROM keyword", tokens[current]);
      }
      current++;

      const source = parseExpression();

      return {
        type: ASTNodeTypes.IMPORT_STATEMENT,
        left: identifier,
        right: source,
      };
    };

    while (current < tokens.length) {
      const token = tokens[current];

      if (token.type === TokenTypes.IMPORT) {
        ast.push(parseImportStatement());
      } else if (token.type === TokenTypes.SELECT) {
        ast.push(parseSelectStatement());
      } else {
        throw new ParserError(`Unexpected token: ${token.value}`, token);
      }
    }
  } catch (error) {
    throw error;
  }

  return ast;
};
