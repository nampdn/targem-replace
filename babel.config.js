module.exports = function (api) {
  api.cache(true)

  const presets = [
    ["@babel/preset-typescript", { allExtensions: true, isTSX: true }],
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        useBuiltIns: "entry",
        corejs: {
          version: "3",
          proposal: true,
        },
        // modules: "auto",
        targets: {
          browsers: [
            "edge >= 16",
            "safari >= 9",
            "firefox >= 57",
            "ie >= 11",
            "ios >= 9",
            "chrome >= 49",
          ],
        },
        // debug: true,
      },
    ],
  ]
  const plugins = [
    "@babel/plugin-transform-runtime",
    ["@babel/plugin-proposal-object-rest-spread", { useBuiltIns: true }],
    // "@babel/plugin-transform-spread",
    ["@babel/plugin-proposal-class-properties", { loose: true }],
    "@babel/plugin-transform-parameters",
    // "@babel/plugin-transform-classes",
  ]

  return {
    presets,
    plugins,
    overrides: [
      {
        test: "./node_modules",
        sourceType: "unambiguous",
      },
    ],
    env: {
      development: {
        presets: [["@babel/preset-react", { development: true }]],
      },
    },
  }
}
