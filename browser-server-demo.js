var library = require("module-library")(require)

library.define(
  "boot-tree",[
  "a-wild-universe-appeared",
  "an-expression",
  "make-request"],
  function(aWildUniverseAppeared, anExpression, makeRequest) {

    function bootTree(programName) {
      var tree = this.tree = anExpression.tree()
      var universe = aWildUniverseAppeared(
        "expression-tree", {
        anExpression: "an-expression"})

      universe.mute()
      tree.logTo(universe)

      tree.addExpressionAt(
        tree.reservePosition(),
        anExpression.functionLiteral())

      universe.onStatement(save)

      return tree
    }

    function save(functionName, args) {

      var data = {
        functionName: functionName,
        args: args,
      }

      makeRequest({
        method: "post",
        path: "/universes/expression-trees",
        data: data })
    }

    return bootTree
  }
)


library.using(
  [library.ref(), "puppeteer", "web-site", "fs", "./site-server", "a-wild-universe-appeared", "an-expression", "write-code", "browser-bridge", "web-element", "boot-tree", "bridge-module"],
  function(lib, puppeteer, WebSite, fs, SiteServer, aWildUniverseAppeared, anExpression, writeCode, BrowserBridge, element, bootTree, bridgeModule) {



    // Settin up infra:

    var baseSite = new WebSite()

    baseSite.addRoute("get", "/kill", function(request, response) {
      response.send("dying...")
      setTimeout(function() {
        launchedBrowser && launchedBrowser.close()
        baseSite.stop()
      })
    })

    var sites = new SiteServer(baseSite)

    console.log("Starting")
    baseSite.start(3002)

    var programs = aWildUniverseAppeared(
      "programs", {
      anExpression: "an-expression"})

    programs.mirrorTo({
      "an-expression": anExpression })

    baseSite.addRoute(
      "post",
      "/universes/expression-trees",
      function(request, response) {
        var statement = request.body

        var doArgs = [statement.functionName].concat(statement.args)

        programs.do.apply(programs, doArgs)

        response.send({ok: true})
      }
    )

    writeCode.prepareSite(baseSite)

    baseSite.addRoute(
      "get",
      "/edit/:name",
      function(request, response) {

      var routeParam = request.params.name

      var bridge = new BrowserBridge().forResponse(response)

      var partial = bridge.partial()

      var tree = bridge.defineSingleton(
        "treeSingleton",[
        bridgeModule(lib, "boot-tree", bridge),
        routeParam],
        function(bootTree, name) {
          return bootTree(name)
        }
      )

      

      writeCode(partial, tree)

      var iframe = element("iframe", {src: "/sites/"+name})

      bridge.send([
        iframe,
        partial
      ])

    })


    // Get a server server:

    // puppeteer.launch().then(function(browser) {
    //   launchedBrowser = browser

    //   browser.newPage().then(loadServerOne)

    //   function loadServerOne(page) {
    //     page.goto("http://localhost:3002/servers/write-code").then(done)
    //   }

    //   function done() {
    //     console.log("browser launched. Visit http://localhost:3002/sites/write-code/")
    //     console.log("\nhttp://localhost:3002/kill to kill")
    //   }
    // })

  }
)




// createBrowserContext for security: 
//  https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-createBrowserContext
// https://github.com/cyrus-and/chrome-remote-interface/issues/118

// Streaming HTTP server interfaces:
// http://www.apachetutor.org/dev/brigades
// https://hexdocs.pm/raxx/Raxx.html


