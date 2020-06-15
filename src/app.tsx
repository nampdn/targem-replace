import React, { useState } from "react"

import { open } from "tauri/api/dialog"

import { FileList, Translating } from "./components"

import { makeStyles } from "@material-ui/core/styles"
import Typography from "@material-ui/core/Typography"
import InsertLinkIcon from "@material-ui/icons/InsertLink"
import SendIcon from "@material-ui/icons/Send"
import { Button, Box } from "@material-ui/core"

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
      if (files && files.length > 0) {
        setOutput(outputDir)
        setTranslatingIndex(translatingIndex + 1)
      }
    })
  }

  const updateProgress = (progressData: any) => {}

  const nextItem = () => {
    setTranslatingIndex(translatingIndex + 1)
  }

  return (
    <Box
      component="div"
      display="flex"
      flexDirection="column"
      color="text.primary"
      height="100%"
    >
      <Box display="flex" justifyContent="space-between" padding={2}>
        <Button
          color="default"
          variant="contained"
          startIcon={<InsertLinkIcon />}
          onClick={openSelectFiles}
        >
          Browse...
        </Button>
        <Typography>Dest: {output}</Typography>
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
          file={{ input: files[translatingIndex], output }}
          onVerseTranslated={updateProgress}
          onFileCompleted={nextItem}
        />
      )}
      <Box margin="18" flex={1} overflow="scroll">
        <FileList files={files} />
      </Box>
    </Box>
  )
}
