export const dynamic = "force-dynamic";
import { parse } from "../../../compiler/ast";
import { tokenize } from "../../../compiler/lexer";
import { generateCode } from "../../../compiler/parser";
import ts from "typescript";
import vm from "vm";

export async function POST(request: Request) {
  const body = await request.json();

  const tokens = tokenize(body.code);
  const code = generateCode(parse(tokens));
  const jsCode = ts.transpile(code);
  const context = {
    fs: require("node:fs"),
    csv: require("csv-parser"),
    console: console,
    require: require,
    result: null,
  };
  vm.createContext(context);
  const script = new vm.Script(`
      new Promise((resolve, reject) => {
        ${jsCode}
      }).then(data => {
        result = data;
      }).catch(err => {
        console.error(err);
      });
    `);

  try {
    await script.runInContext(context);

    return new Response(JSON.stringify(context.result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    return new Response(error.message, {
      status: 500,
    });
  }
}
