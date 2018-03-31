var library = require("module-library")(require)

module.exports = library.export(
  "web-host", [
  library.ref(),
  "browser-task",
  "write-code",
  "a-wild-universe-appeared",
  "web-site", "an-expression", "javascript-to-ezjs", "./host-from-browser"],
  function(library, browserTask, writeCode, aWildUniverseAppeared, webSite, anExpression, javascriptToEzjs) {

    function webHost(host, moduleName) {

      var universe = aWildUniverseAppeared("hello-world source tree")
      var tree = anExpression.tree()
      tree.logTo(universe, true)
      universe.mute()

      javascriptToEzjs(library.getSource(moduleName), tree)


      // Editor

      writeCode.prepareSite(
        host,
        universe,
        "hello-world")

      host.addRoute(
        "get",
        "/edit/"+moduleName,
        function(request, response) {
          var bridge = new BrowserBridge().forResponse(response)

          writeCode(
            bridge,
            treeBinding,
            tree)})


      // Host Interface

      baseServer.addRoute("get", "/host/hello-world", function(request, response) {
        var bridge = new BrowserBridge().forResponse(response)
        function getSource() {
          tree.toJavaScript()
        }        
        serverRunnerPage(bridge, "hello-world", getSource)})


      // Provision a Sysadmin

      var browser = browserTask(
        host.url(
          "/host/"+moduleName))
    }

    return webHost})

library.using(
  ["web-host", "web-site", "./hello-world"],
  function(webHost, WebSite) {
    var site = new WebSite()
    site.start(1413)
    webHost(site, "hello-world")})
