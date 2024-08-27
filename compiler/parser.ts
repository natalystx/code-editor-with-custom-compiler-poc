import path from "path";
import { ASTNode, ASTNodeTypes } from "./ast";

export const generateCode = (ast: ASTNode[]): string => {
  let code = "";

  ast.forEach((node) => {
    switch (node.type) {
      case ASTNodeTypes.IMPORT_STATEMENT:
        code += generateImportStatement(node);
        break;

      case ASTNodeTypes.SELECT_STATEMENT:
        code += generateSelectStatement(node);
        break;

      default:
        throw new Error(`Unknown AST node type: ${node.type}`);
    }
  });

  return code;
};

const generateImportStatement = (node: ASTNode): string => {
  const variableName = node.left?.value;
  const filePath = node.right?.value;

  return `const ${variableName} = '${filePath}';\n`;
};

const generateSelectStatement = (node: ASTNode): string => {
  const fileName = node.consequent?.value;
  let code = "";

  code += `const result = [];\n`;

  code += `fs.createReadStream(${fileName})\n  .pipe(csv())\n  .on('data', (row) => {\n`;

  if (node.condition) {
    if (node.condition.type === ASTNodeTypes.WHERE_CLAUSE) {
      code += `    if (${generateCondition(
        node.condition.condition!
      )}) {\n      result.push(row);\n    }\n`;
    } else {
      throw new Error(`Unsupported node type: ${node.condition.type}`);
    }
  } else {
    code += `   result.push(row);\n`;
  }

  code += `  })\n  .on('end', () => {\n    resolve(result);\n  })\n  .on('error', (err) => reject(err));\n`;

  return code;
};

const generateCondition = (node: ASTNode): string => {
  if (node.type === ASTNodeTypes.BINARY_EXPRESSION) {
    const left = generateCondition(node.left!);
    const right = generateCondition(node.right!);

    let operator = node.value;
    if (operator === "=") {
      operator = "===";
    } else if (operator === "!=") {
      operator = "!==";
    } else if (operator === "AND") {
      operator = "&&";
    } else if (operator === "OR") {
      operator = "||";
    }

    return `${left} ${operator} ${right}`;
  } else if (node.type === ASTNodeTypes.IDENTIFIER) {
    return `row['${node.value}']`;
  } else if (node.type === ASTNodeTypes.NUMBER_LITERAL) {
    return `${node.value}`;
  } else if (node.type === ASTNodeTypes.STRING_LITERAL) {
    return `'${node.value}'`;
  } else if (node.type === ASTNodeTypes.BOOLEAN_LITERAL) {
    return `${node.value}`;
  } else if (node.type === ASTNodeTypes.WHERE_CLAUSE) {
    return generateCondition(node.condition!);
  }

  throw new Error(`Unsupported condition node type: ${node.type}`);
};
