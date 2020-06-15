import React, { useState, useEffect } from "react"
import stripHtml from "string-strip-html"
import { makeStyles } from "@material-ui/core/styles"
import LinearProgress from "@material-ui/core/LinearProgress"
import Typography from "@material-ui/core/Typography"
import pThrottle from "p-throttle"

import { readTextFile, writeFile } from "tauri/api/fs"

import { throttledTranslate } from "../api/translate"
import { parseSubtitle } from "../api/subtitle"

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
})

interface TranslatingProps {
  file: any | null
  onVerseTranslated?: (data: any) => void
  onFileLoaded?: (data: any) => void
}

export const Translating = ({
  file,
  onVerseTranslated = (...args: any[]) => null,
  onFileLoaded = (...args: any[]) => null,
}: TranslatingProps) => {
  const classes = useStyles()
  const [data, setData] = useState({
    origin: null,
    translated: null,
    progress: 0,
  })

  const startTranslate = async (file: string) => {
    const fileContent = await readTextFile(file)
    const srtData = await parseSubtitle(fileContent)
    const result: any[] = []
    onFileLoaded({ total: srtData.length, data: srtData })
    let i = 0
    for (const line of srtData) {
      const origin = stripHtml(line.text)
      const translated = await throttledTranslate(origin)
      const translateData = { ...line, text: translated }
      const progress = Math.round((i / srtData.length) * 100)
      const status = { origin, translated, progress }
      result.push(translateData)
      onVerseTranslated(status)
      setData(status)
      i += 1
      if (i > 3) break
    }
  }

  useEffect(() => {
    if (file != null) {
      console.log(`Translating`, file.input)
      startTranslate(file.input.file)
    }
  }, [file])

  return (
    <div className={classes.root}>
      <LinearProgress variant="determinate" value={data.progress} />
      <Typography variant="caption">
        Translating: {data.origin} = {data.translated}
      </Typography>
      <Typography variant="caption">Status: {data.progress}</Typography>
    </div>
  )
}
