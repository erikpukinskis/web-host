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

      universe.do("anExpression.tree", tree.id)

      tree.addExpressionAt(
        tree.reservePosition(),
        anExpression.functionLiteral())

      var save = saveUniverse.bind(null, universe)

      tree.save = rewriteIds.bind(null, tree, universe, save)

      return tree
    }

    function saveUniverse(universe) {
      var statements = []

      var fromMark = universe.getLastSyncMark()
      var toMark = universe.mark()
      var statements = universe.getStatements(fromMark, toMark)

      makeRequest({
        method: "post",
        path: "/universes/expression-trees",
        data: {
          mark: fromMark,
          statements: statements}},
        function(response) {
          if (response && response.status == 200) {
            universe.markSynced(toMark, response.mark)
          }
        }
      )
    }

    function rewriteIds(tree, universe, callback) {

      var forkIds = tree.getLocalTreeIds()
      var path = "/an-expression/reserve-tree-ids/"+forkIds.length+"?not="+forkIds.join(",")

      if (forkIds.length == 0) {
        return callback()
      }

      makeRequest({
        method: "post",
        path: path},
        function(ids) {
          var globalIds = keysWithValues(forkIds, ids)

          tree.swapInGlobalTreeIds(globalIds)

          universe.rewriteArguments(
            "anExpression.*",
            0,
            globalIds
          )

          callback()
        }
      )
    }

    function keysWithValues(keys, values) {
      var object = {}
      keys.forEach(function(key, i) {
        object[key] = values[i]
      })
      return object
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
        request.body.statements.forEach(function(statement) {
          var doArgs = [statement.functionName].concat(statement.args)

          programs.do.apply(programs, doArgs)
        })

        response.send({ok: true})
      }
    )

    baseSite.addRoute(
      "post",
      "/an-expression/reserve-tree-ids/:count",
      function(request, response) {

        if (request.query.not) {
          var taken = request.query.not.split(",")
        }

        var count = request.params.count

        if (!Number.isInteger(count)) {
          count = 1
        }

        if (count > 100) {
          return response.json({error: "You can only reserve 100 statement tree ids at a time"})
        }

        var ids = []

        while(ids.length < count) {
          var id = anExpression.treeId()
          if (!taken || !contains(taken, id)) {
            ids.push(id)
          }
        }

        response.send(ids)
      }
    )

    function contains(array, value) {
      if (!Array.isArray(array)) {
        throw new Error("looking for "+JSON.stringify(value)+" in "+JSON.stringify(array)+", which is supposed to be an array. But it's not.")
      }
      var index = -1;
      var length = array.length;
      while (++index < length) {
        if (array[index] == value) {
          return true;
        }
      }
      return false;
    }


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

      var saveButton = element(
        "button", {
        onclick: tree.methodCall("save").evalable() },
        "Save")

      writeCode(partial, tree)

      var iframe = element("iframe", {src: "/sites/"+name})

      bridge.send([
        iframe,
        saveButton,
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


