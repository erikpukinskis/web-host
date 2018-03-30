var library = require("module-library")(require)

module.exports = library.export(
  "hello-world",
  ["web-element"],
  function(webElement) {
    return function(bridge) {
      var hi = webElement(
        "h1",
        "hello, world")
      bridge.send(
        hi)}})
