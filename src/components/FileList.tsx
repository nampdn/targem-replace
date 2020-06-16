import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import ListItemIcon from "@material-ui/core/ListItemIcon"
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction"
import ListItemText from "@material-ui/core/ListItemText"
import IconButton from "@material-ui/core/IconButton"
import CommentIcon from "@material-ui/icons/Comment"
import CheckIcon from "@material-ui/icons/Check"
import TranslateIcon from "@material-ui/icons/Translate"
import CircularProgress from "@material-ui/core/CircularProgress"

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    flex: 1,
    backgroundColor: theme.palette.background.paper,
  },
}))

export function FileList({ files = [] }) {
  const classes = useStyles()
  const [] = React.useState([0])

  return (
    <List className={classes.root}>
      {files.map((value) => {
        const labelId = `checkbox-list-label-${value}`

        return (
          <ListItem key={value.file} role={undefined} dense button>
            <ListItemIcon>
              {value.finished ? (
                <CheckIcon color="primary" />
              ) : value.started ? (
                <CircularProgress color="primary" size={20} />
              ) : (
                <TranslateIcon />
              )}
            </ListItemIcon>
            <ListItemText id={labelId} primary={value.file} />
            {/* <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="comments">
                <CommentIcon />
              </IconButton>
            </ListItemSecondaryAction> */}
          </ListItem>
        )
      })}
    </List>
  )
}
