import "react-app-polyfill/ie11"
import "react-app-polyfill/stable"
import "core-js/stable"
import React from "react"
import ReactDOM from "react-dom"
import { App } from "./app"

ReactDOM.render(<App />, document.getElementById("root"))
