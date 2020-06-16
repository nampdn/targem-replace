module.exports = function (api) {
  api.cache(true)

  const presets = [
    ["@babel/preset-typescript", { allExtensions: true, isTSX: true }],
    "@babel/preset-react",
    [
      "@babel/preset-env",
      {
        useBuiltIns: "usage",
        loose: true,
        corejs: "2.6.5",
        // modules: "auto",
        targets: {
          esmodules: false,
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
  }
}
