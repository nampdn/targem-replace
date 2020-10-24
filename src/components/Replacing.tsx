import React, { useCallback, useEffect, useState } from "react"
import { parseSubtitle, saveArrayToFile } from "../api/subtitle"

import Box from "@material-ui/core/Box"
import LinearProgress from "@material-ui/core/LinearProgress"
import Typography from "@material-ui/core/Typography"
import { makeStyles } from "@material-ui/core/styles"
import { readTextFile } from "tauri/api/fs"

const stripHtml = (s) => s.replace(/(<([^>]+)>)/gi, "")

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
})

interface ReplacingProps {
  file: any | null
  onFileLoaded?: (data: any) => void
  onFileCompleted?: (data: any) => void
}

const randomBetween = (start: number, end: number) =>
  Math.floor(Math.random() * end) + start

export const Replacing = ({
  file,
  onFileLoaded = (...args: any[]) => null,
  onFileCompleted = (...args: any[]) => null,
}: ReplacingProps) => {
  const classes = useStyles()
  const [data, setData] = useState({
    origin: null,
    translated: null,
    progress: 0,
  })
  const [replacing, setReplacing] = useState(false)

  const startTranslate = useCallback(async (file: string) => {
    const fileContent = await readTextFile(file)
    let srtData = await parseSubtitle(fileContent)
    // srtData.splice(5, 10000) // DEBUG TO FAST SKIP FILE ONLY
    const result: any[] = []
    onFileLoaded({ total: srtData.length, data: srtData })
    let linenumber = 0
    for (const line of srtData) {
      const rawText = stripHtml(line.text)
      result.push(rawText)
      linenumber += 1
    }
    return result
  }, [])

  useEffect(() => {
    if (file != null && !replacing) {
      setReplacing(true)
      startTranslate(file.input.file).then(async (result: any[]) => {
        try {
          setReplacing(false)
          const outputFile = await saveArrayToFile(file.output, result)
          onFileCompleted(outputFile)
        } catch (err) {
          console.error(err)
        }
      })
    }
  }, [file])

  return (
    <div className={classes.root}>
      <LinearProgress
        variant="buffer"
        value={data.progress}
        valueBuffer={
          data.progress < 93
            ? data.progress + randomBetween(1, 7)
            : data.progress
        }
      />
      {replacing && (
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="space-between"
          marginTop={1}
        >
          <Typography variant="caption">{data.origin}</Typography>
          <Typography variant="caption">{data.translated}</Typography>
        </Box>
      )}
    </div>
  )
}
