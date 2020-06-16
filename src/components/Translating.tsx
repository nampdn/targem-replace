import React, { useState, useEffect, useCallback } from "react"
import { makeStyles } from "@material-ui/core/styles"
import LinearProgress from "@material-ui/core/LinearProgress"

import { readTextFile } from "tauri/api/fs"

import { translateWithLibrary } from "../api/translate"
import { parseSubtitle, saveSubtitleFile } from "../api/subtitle"
import { setTimeout } from "timers"
import Typography from "@material-ui/core/Typography"
import Box from "@material-ui/core/Box"

const stripHtml = (s) => s.replace(/(<([^>]+)>)/gi, "")

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
  const [translating, setTranslating] = useState(false)

  const startTranslate = useCallback(async (file: string) => {
    const fileContent = await readTextFile(file)
    const srtData = await parseSubtitle(fileContent)
    const result: any[] = []
    onFileLoaded({ total: srtData.length, data: srtData })
    let linenumber = 0
    let buffer = ""
    for (const line of srtData) {
      const rawText = stripHtml(line.text)
      if (buffer.length < 500) {
        buffer += "\n\n" + rawText
      }

      if (buffer.length >= 500 || linenumber + 1 >= srtData.length) {
        const origin = stripHtml(buffer)
        console.log("Calling translate for:", origin)
        const translated = await translateWithLibrary(origin)
        const splitter = translated.split("\n\n")
        console.log(`prepare ${splitter.length} items of ${translated}`)
        let i = linenumber - splitter.length + 1
        for (const translatedLine of splitter) {
          const translateData = { ...srtData[i], text: translatedLine }
          const progress = Math.round((i + 1 / srtData.length) * 100)
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
            status,
          )
          onVerseTranslated(status)
          setData(status)
          i += 1
        }
        // Reset counting to next round
        buffer = rawText
      }
      linenumber += 1
    }
    return result
  }, [])

  useEffect(() => {
    if (file != null && !translating) {
      console.log("receiving props", file)
      setTranslating(true)
      startTranslate(file.input.file).then(async (result: any[]) => {
        try {
          const outputFile = await saveSubtitleFile(
            file.input.file,
            file.output,
            result,
          )
          onFileCompleted(outputFile)
          console.log(`Translated saved at: ${outputFile}`)
          setTranslating(false)
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
      {translating && (
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
