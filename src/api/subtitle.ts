import { parse, stringify } from "subtitle";

export const parseSubtitle = (fileContent: string) => {
  return parse(fileContent);
};
