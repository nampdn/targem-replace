import { parse, stringify } from "subtitle"
import { writeFile } from "tauri/api/fs"
import path from "path-browserify"

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
