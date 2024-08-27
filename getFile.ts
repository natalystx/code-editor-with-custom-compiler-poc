import path from "path";

export const getFile = (filePath: string): string => {
  return path.join(process.cwd(), filePath);
};
