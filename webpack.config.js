const path = require("path");
const webpack = require("webpack");

module.exports = {
  entry: {
    entry: "./demo/index.js",
    vendor: "./demo/vendor.js",
    "vendor-two": "./demo/vendor-two.js"
  },
  output: {
    filename: "[name].[chunkhash].js",
    path: path.resolve(__dirname, "./lib")
  },
  recordsPath: path.resolve(__dirname, "./records.json"),
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      names: ["vendor", "vendor-two", "runtime"],
      minChunks: Infinity
    })
  ]
};
