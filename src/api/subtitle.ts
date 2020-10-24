import { parse, stringify } from "subtitle"

import path from "path-browserify"
import { writeFile } from "tauri/api/fs"

export const parseSubtitle = (fileContent: string) => {
  return parse(fileContent)
}

export const saveSubtitleFile = async (
  source: string,
  destination: string,
  srtObject: any,
) => {
  let file_splitter = path.parse(source.replace(/\\/g, "/"))
  const filename = file_splitter.base
  const outputfile = path.join(destination, filename).replace(/\//g, "\\")
  const srtString = stringify(srtObject)
  console.log(`Saving file ${outputfile}`, srtString)
  await writeFile({ file: outputfile, contents: srtString })
  return outputfile
}

export const saveArrayToFile = async (
  outputFile: string,
  strArray: string[],
) => {
  const combinedStr = strArray.join("\n")
  await writeFile({ file: outputFile, contents: combinedStr })
  return outputFile
}
