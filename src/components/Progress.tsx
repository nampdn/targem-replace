import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import Box from "@material-ui/core/Box"
import CircularProgress from "@material-ui/core/CircularProgress"
import Typography from "@material-ui/core/Typography"

const useStyles = makeStyles(() => ({
  circularLabel: {
    fontSize: 8,
    fontWeight: "bold",
  },
}))

export const ProgressLabel = (props) => {
  const classes = useStyles()
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="static" {...props} />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="caption"
          component="div"
          color="textSecondary"
          className={classes.circularLabel}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  )
}
