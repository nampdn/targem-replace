import React, { useState, useEffect } from "react"
import stripHtml from "string-strip-html"
import { makeStyles } from "@material-ui/core/styles"
import LinearProgress from "@material-ui/core/LinearProgress"

import { readTextFile } from "tauri/api/fs"

import { throttledTranslate, translateWithLibrary } from "../api/translate"
import { parseSubtitle, saveSubtitleFile } from "../api/subtitle"
import { setTimeout } from "timers"
import Typography from "@material-ui/core/Typography"
import Box from "@material-ui/core/Box"

const useStyles = makeStyles({
  root: {
    width: "100%",
  },
})

interface TranslatingProps {
  file: any | null
  onVerseTranslated?: (data: any) => void
  onFileLoaded?: (data: any) => void
  onFileCompleted?: (data: any) => void
}

export const delay = async (time: number) => {
  return new Promise((resolve, _) => {
    setTimeout(() => {
      resolve()
    }, time)
  })
}

export const randomBetween = (start: number, end: number) =>
  Math.floor(Math.random() * end) + start

export const Translating = ({
  file,
  onVerseTranslated = (...args: any[]) => null,
  onFileLoaded = (...args: any[]) => null,
  onFileCompleted = (...args: any[]) => null,
}: TranslatingProps) => {
  const classes = useStyles()
  const [data, setData] = useState({
    origin: null,
    translated: null,
    progress: 0,
  })

  const startTranslate = async (file: string, outputDir: string) => {
    const fileContent = await readTextFile(file)
    const srtData = await parseSubtitle(fileContent)
    const result: any[] = []
    onFileLoaded({ total: srtData.length, data: srtData })
    let linenumber = 0
    let buffer = ""
    // let bufferArray = []
    for (const line of srtData) {
      const rawText = stripHtml(line.text)
      if (buffer.length > 500) {
        const origin = stripHtml(buffer)
        const translated = await translateWithLibrary(origin)
        const splitter = translated.split("\n\n")
        console.log(`prepare ${splitter.length} items of ${translated}`)
        let i = linenumber - splitter.length
        for (const translatedLine of splitter) {
          const translateData = { ...srtData[i], text: translatedLine }
          const progress = Math.floor((i / srtData.length) * 100)
          const status = {
            origin: stripHtml(srtData[i].text),
            translated: translatedLine,
            progress,
          }
          result.push(translateData)
          const sleep = randomBetween(100, 1000)
          await delay(sleep)
          console.log(
            `Processing`,
            srtData[i],
            translateData.text,
            `sleep ${sleep}`,
          )
          onVerseTranslated(status)
          setData(status)
          i += 1
        }
        // Reset counting to next round
        buffer = rawText
      } else {
        buffer += "\n\n" + rawText
      }
      linenumber += 1
    }

    try {
      const outputFile = await saveSubtitleFile(file, outputDir, result)
      onFileCompleted(outputFile)
      console.log(`Translated saved at: ${outputFile}`)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    if (file != null) {
      console.log(`Translating`, file.input)
      startTranslate(file.input.file, file.output)
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
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
        marginTop={1}
      >
        <Typography variant="caption">{data.origin}</Typography>
        <Typography variant="caption">{data.translated}</Typography>
      </Box>
    </div>
  )
}
