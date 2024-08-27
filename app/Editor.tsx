"use client";

import React, { useEffect } from "react";
import { Editor, useMonaco } from "@monaco-editor/react";

const MyEditor = () => {
  const [code, setCode] = React.useState(`IMPORT file FROM 'file/data.csv' 
SELECT * FROM file
WHERE 
(Data_value <= '80078' AND Period = '2011.06')`);
  const [result, setResult] = React.useState<any>(null);
  const monaco = useMonaco();

  const [init, setInit] = React.useState(false);

  useEffect(() => {
    if (!monaco) return;

    // Register CSVQL language
    monaco.languages.register({ id: "csvql" });

    // Token provider for the language
    monaco.languages.setMonarchTokensProvider("csvql", {
      keywords: ["IMPORT", "FROM", "SELECT", "WHERE", "AND", "OR"],
      operators: ["=", "!=", ">", "<", ">=", "<="],
      tokenizer: {
        root: [
          [
            /[a-z_$][\w$]*/,
            { cases: { "@keywords": "keyword", "@default": "identifier" } },
          ],
          [/[0-9]+/, "number"],
          [/[=><!]+/, { cases: { "@operators": "operator", "@default": "" } }],
          [/'[^']*'/, "string"],
          [/\s+/, "white"],
        ],
      },
    });

    // Language configuration
    monaco.languages.setLanguageConfiguration("csvql", {
      brackets: [["(", ")"]],
      autoClosingPairs: [
        { open: "'", close: "'" },
        { open: "(", close: ")" },
      ],
      surroundingPairs: [
        { open: "'", close: "'" },
        { open: "(", close: ")" },
      ],
    });

    // Completion item provider for CSVQL language
    monaco.languages.registerCompletionItemProvider("csvql", {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions = [
          {
            label: "IMPORT",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "IMPORT",
            range,
          },
          {
            label: "FROM",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "FROM",
            range,
          },
          {
            label: "SELECT",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "SELECT",
            range,
          },
          {
            label: "WHERE",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "WHERE",
            range,
          },
          {
            label: "AND",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "AND",
            range,
          },
          {
            label: "OR",
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: "OR",
            range,
          },
        ];

        return { suggestions: suggestions };
      },
    });

    setInit(true);
  }, [monaco]);

  const query = async () => {
    const response = await fetch("/api/query", {
      method: "POST",
      body: JSON.stringify({ code }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    setResult(data);
  };

  return (
    <div className="w-full">
      <div className="w-full justify-between flex p-2 px-12 items-center">
        <a href="/file/data.csv" download className="text-blue-400 underline">
          Download File Example
        </a>
        <button onClick={query} className="p-2 bg-slate-500">
          Run
        </button>
      </div>
      {init ? (
        <Editor
          defaultValue="IMPORT file FROM 'file/data.csv'"
          height="30vh"
          theme="vs-dark"
          defaultLanguage="csvql"
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      ) : null}

      <div>
        <h2>Result</h2>
        <pre>{JSON.stringify(result, null, 2)}</pre>
      </div>
    </div>
  );
};

export default MyEditor;
