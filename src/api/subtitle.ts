import { parse, stringify } from "subtitle"
import { writeFile } from "tauri/api/fs"

export const parseSubtitle = (fileContent: string) => {
  return parse(fileContent)
}

export const saveSubtitleFile = async (
  source: string,
  destination: string,
  srtObject: any,
) => {
  let file_splitter = source.split("/")
  const filename = file_splitter[file_splitter.length - 1]
  const outputfile = `${destination}/${filename}`
  const srtString = stringify(srtObject)
  console.log(`Saving file ${outputfile}`, srtString)
  await writeFile({ file: outputfile, contents: srtString })
  return outputfile
}
