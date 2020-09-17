const path = require("path");

module.exports = {
   entry: path.join(__dirname, "/2x2/src/index.js"),
   output: {
       filename: "build.js",
       path: path.join(__dirname, "/2x2/dist/")},
   module:{
       rules:[{
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "babel-loader"
       }]
   },
   plugins:[],
   watch: true
}