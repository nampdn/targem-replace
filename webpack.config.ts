import path from "path"
import webpack from "webpack"

import PurgecssPlugin from "purgecss-webpack-plugin"
import TerserPlugin from "terser-webpack-plugin"
import glob from "glob"
import HtmlWebpackPlugin from "html-webpack-plugin"

const mode = process.env.NODE_ENV || "development"
const devMode = mode !== "production"
const tauriMode = !!process.env.TAURI

export default function (_, argv): webpack.Configuration[] {
  if (argv.production && argv.dev) {
    throw new Error("Cannot pass the --dev and --production flags!")
  }

  const isProd = !!argv.production
  const outputPath = path.resolve(__dirname, "dist")
  const outputHtmlFilename = "index.html"

  const createConfig = (projectName) => {
    const config: webpack.Configuration = {
      devtool: isProd ? false : "inline-source-map",
      mode: "none",
      entry: {
        [projectName]: path.resolve(__dirname, "src/index.tsx"),
      },
      output: {
        path: outputPath,
        filename: "[name].js",
      },
      module: {
        rules: [
          {
            test: /\.css$/,
            use: [
              {
                loader: "style-loader",
              },
              { loader: "css-loader" },
            ],
          },
          {
            test: /\.ts$|tsx|js/,
            use: [
              {
                loader: "babel-loader",
                options: {
                  babelrc: false,
                  configFile: path.resolve(__dirname, "babel.config.js"),
                  compact: false,
                  cacheDirectory: true,
                  sourceMaps: false,
                },
              },
            ],
            // exclude: [/\bcore-js\b/, /\bwebpack\/buildin\b/],
            exclude: /@babel(?:\/|\\{1,2})runtime|core-js/,
            // exclude: [/node_modules\/(!?(tauri)\/.*)/],
          },
        ],
      },
      resolve: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
      plugins: [
        new PurgecssPlugin({
          paths: glob.sync(`../dist/${projectName}/*`),
        }),
        new HtmlWebpackPlugin({
          filename: outputHtmlFilename,
          template: path.resolve(__dirname, "src/template.html"),
          minify: isProd
            ? {
                collapseWhitespace: true,
                removeComments: true,
              }
            : false,
        }),
      ],
    }

    if (isProd) {
      config.mode = "production"
      config.optimization = {
        minimizer: [new TerserPlugin()],
      }
    }

    return config
  }

  const outputConfigs = [createConfig("app")]

  // Tack on the webserver to the first one...
  if (!isProd) {
    outputConfigs[0].devServer = {
      contentBase: path.join(__dirname, "dist"),
      compress: true,
      port: 9000,
    }
  }

  return outputConfigs
}
