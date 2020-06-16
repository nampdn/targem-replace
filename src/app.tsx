import React, { useState } from "react"

import { open } from "tauri/api/dialog"

import { makeStyles } from "@material-ui/core/styles"
import Box from "@material-ui/core/Box"
import Typography from "@material-ui/core/Typography"
import InsertLinkIcon from "@material-ui/icons/InsertLink"
import DoneAllIcon from "@material-ui/icons/DoneAll"
import SendIcon from "@material-ui/icons/Send"
import { Button } from "@material-ui/core"

import { FileList, Translating, ProgressLabel } from "./components"

const useStyles = makeStyles((theme) => ({
  button: {
    margin: theme.spacing(1),
  },
}))

export const selectFiles = async () => {
  try {
    const files = await open({ multiple: true })
    return files
  } catch (err) {
    console.error("Error: ", err)
  }
}

const openModal = async (options?: any) => {
  try {
    const files = await open(options)
    return files
  } catch (err) {
    return null
  }
}

export function App(): React.ReactElement {
  const classes = useStyles()
  const [files, setFiles] = useState([])
  const [output, setOutput] = useState("")
  const [translatingIndex, setTranslatingIndex] = useState(-1)
  const [done, setDone] = useState(false)

  const updateFiles = (fileList: string[]) => {
    const filesWithMeta = fileList.map((f) => ({
      file: f,
      started: false,
      finished: false,
    }))
    setFiles(filesWithMeta)
  }

  const openSelectFiles = () => {
    selectFiles().then((selectedFiles: string[]) => {
      updateFiles(selectedFiles)
    })
  }

  const translate = () => {
    openModal({ directory: true }).then((outputDir) => {
      setDone(false)
      if (files && files.length > 0) {
        setOutput(outputDir)
        nextItem()
      }
    })
  }

  const updateProgress = (data: any) => {}

  const nextItem = () => {
    const nextIndex = translatingIndex + 1
    if (translatingIndex != -1) files[translatingIndex].finished = true
    if (nextIndex < files.length) {
      files[nextIndex].started = true
      setFiles(files)
      setTranslatingIndex(nextIndex)
    } else {
      setTranslatingIndex(-1)
      setDone(true)
    }
  }

  const translatingFile = files[translatingIndex]
    ? { input: files[translatingIndex], output, index: translatingIndex }
    : null

  return (
    <Box
      component="div"
      display="flex"
      flexDirection="column"
      color="text.primary"
      height="100%"
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        padding={2}
      >
        <Button
          color="default"
          variant="contained"
          startIcon={<InsertLinkIcon />}
          onClick={openSelectFiles}
        >
          Browse...
        </Button>
        {done ? (
          <DoneAllIcon />
        ) : translatingIndex === -1 ? (
          files.length === 0 ? (
            <Typography>{"<="} Select any SRT file(s) to translate</Typography>
          ) : (
            <Typography>
              Press "TRANSLATE" and select output folder {"=>"}
            </Typography>
          )
        ) : (
          <ProgressLabel
            value={Math.round((translatingIndex / files.length) * 100)}
          />
        )}
        <Button
          color="primary"
          variant="contained"
          startIcon={<SendIcon />}
          onClick={translate}
        >
          Translate
        </Button>
      </Box>
      {translatingIndex != -1 && (
        <Translating
          file={translatingFile}
          onVerseTranslated={updateProgress}
          onFileCompleted={nextItem}
        />
      )}
      <Box margin="18" height={168} flex={1} overflow="hidden">
        <FileList files={files} />
      </Box>
    </Box>
  )
}
