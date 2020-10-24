import { FileList, ProgressLabel, Replacing } from "./components"
import React, { useState } from "react"
import { createDir, readDir, readTextFile, writeFile } from "tauri/api/fs"

import Box from "@material-ui/core/Box"
import { Button } from "@material-ui/core"
import DoneAllIcon from "@material-ui/icons/DoneAll"
import InsertLinkIcon from "@material-ui/icons/InsertLink"
import SendIcon from "@material-ui/icons/Send"
import Typography from "@material-ui/core/Typography"
import { open } from "tauri/api/dialog"

export const selectFiles = async () => {
  try {
    const files = await open({ multiple: true })
    return files
  } catch (err) {
    // alert(`Error: ${JSON.stringify(err)}`)
  }
}

export const selectDir = async () => {
  try {
    const dir = await open({ directory: true })
    return dir
  } catch (err) {}
}

const walkDir = async (dir: string) => {
  const tree = await readDir(dir, { recursive: true })
  const dirs = tree.filter((p) => p.is_dir)
  const files = tree.filter((p) => !p.is_dir)
  return [dirs, files]
}

const makeDirp = async (dir: string) => {
  try {
    await createDir(dir, { recursive: true })
  } catch (err) {
    console.warn(`Directory ${dir} existed, skip!`, err.message)
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
  const [selectedDir, setSelectedDir] = useState("")
  const [files, setFiles] = useState([])
  const [dirs, setDirs] = useState([])
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

  const openSelectDir = () => {
    // selectFiles().then((selectedFiles: string[]) => {
    //   updateFiles(selectedFiles)
    // })
    selectDir().then((dir: string) => {
      setSelectedDir(dir)
      walkDir(dir).then(([dirs, files]) => {
        updateFiles(files.map((f) => f.path))
        setDirs(dirs.map((d) => d.path))
      })
    })
  }

  const replace = () => {
    openModal({ directory: true }).then(async (outputDir: string) => {
      setDone(false)
      setOutput(outputDir)
      for (const d of dirs) {
        const absoluteOutputDir = d.replace(selectedDir, outputDir)
        await makeDirp(absoluteOutputDir)
      }
      if (files && files.length > 0) {
        nextItem()
      }
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

  console.log(`translating ${translatingIndex}: ${files[translatingIndex]}`)
  const translatingFile =
    translatingIndex > -1 && files[translatingIndex]
      ? {
          input: files[translatingIndex],
          output: files[translatingIndex].file.replace(selectedDir, output),
          index: translatingIndex,
        }
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
          onClick={openSelectDir}
        >
          Browse...
        </Button>
        {done ? (
          <DoneAllIcon />
        ) : translatingIndex === -1 ? (
          files.length === 0 ? (
            <Typography>{"<="} Select directory to replace</Typography>
          ) : (
            <Typography>
              Press "REPLACE" and select output folder {"=>"}
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
          onClick={replace}
        >
          Replace
        </Button>
      </Box>
      {translatingIndex != -1 && (
        <Replacing file={translatingFile} onFileCompleted={nextItem} />
      )}
      <Box margin="18" height={168} flex={1}>
        <FileList files={files} />
      </Box>
    </Box>
  )
}
