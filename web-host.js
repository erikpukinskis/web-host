var library = require("module-library")(require)

module.exports = library.export(
  "web-host", [
  library.ref(),
  "browser-task",
  "write-code",
  "a-wild-universe-appeared",
  "web-site", "an-expression", "javascript-to-ezjs"],
  function(library, browserTask, writeCode, aWildUniverseAppeared, webSite, anExpression, javascriptToEzjs) {

    function webHost(host, moduleName) {

      var universe = aWildUniverseAppeared("hello-world source tree")
      var tree = anExpression.tree()
      tree.logTo(universe, true)
      universe.mute()

      javascriptToEzjs(library.getSource(moduleName), tree)

      // Editor

      host.addRoute("get", "/edit/"+moduleName, writeCode(universe))

      writeCode.prepareSite(host, universe)

      // Host Interface

      host.addRoute("get", "/host/"+moduleName, hostFromBrowser(universe, host))

      var browser = browserTask(
        host.url(
          "/host/"+moduleName))
    }

    return webHost})

library.using(
  ["web-host", "web-site", "./hello-world"],
  function(hostApp, WebSite) {
    debugger
    var site = new WebSite()
    site.start(1413)
    hostApp(site, "hello-world")})
