var library = require("module-library")(require)

library.define(
  "boot-tree",[
  "a-wild-universe-appeared",
  "an-expression",
  "make-request"],
  function(aWildUniverseAppeared, anExpression, makeRequest) {

    function bootTree(programName, previewId) {

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

      var rewrite = rewriteIds.bind(null, tree, universe)

      var save = saveUniverse.bind(null, universe, programName)

      var reload = reloadPreview.bind(null, previewId)

      tree.save = sequence.bind(
        null,[
        rewrite,
        save,
        reload])

      return tree
    }

    function reloadPreview(previewId, callback) {
      document.getElementById(previewId).contentWindow.location.reload()
      callback()
    }

    function saveUniverse(universe, name, callback) {
      var statements = []

      var fromMark = universe.getLastSyncMark()
      var toMark = universe.mark()
      var statements = universe.getStatements(fromMark, toMark)

      makeRequest({
        method: "post",
        path: "/universes/expression-trees/"+name,
        data: {
          mark: fromMark,
          statements: statements}},
        function(response) {
          var success = response && response.status == 200
          if (success) {
            universe.markSynced(toMark, response.mark)
          }
          callback(success)
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

    function sequence(callbacks, completed) {
      if (!completed) {
        completed = 0
      }
      var next = sequence.bind(null, callbacks, completed+1)
      if (!callbacks[completed]) {
        return
      }
      callbacks[completed].call(null, next)
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

    var treeIdsByName = {}

    sites.host(function getSource(name) {
      var tree = anExpression.getTree(treeIdsByName[name])
      return tree.toJavaScript()
    })

    programs.mirrorTo({
      "an-expression": anExpression })

    baseSite.addRoute(
      "post",
      "/universes/expression-trees/:name",
      function(request, response) {

        // We also have response.body.mark... What would we do with it? I guess just flag that mark as "written-from" so we can error if we try to mark from there again? Then we can do retries and not have to worry about doing a double write

        var name = request.params.name

        request.body.statements.forEach(function(statement) {

          if (statement.functionName == "anExpression.tree") {
            treeId = statement.args[0]
            treeIdsByName[name] = treeId
          }

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

      var music = element.template(
        "iframe.soundtrack",
        element.style({
          "position": "absolute",
          "bottom": "50px",
          "width": "150px",
          "height": "100px",
          "opacity": "0.1",
          "border": "0"}),
        function(youTubeId, start, finish) {
          var url = "http://www.infinitelooper.com/?v="+youTubeId+"&p=n#/"
          if (start && finish) {
            url += start+";"+finish
          }
          this.addAttribute("src", url)
        })


      var sound = element.template(
        "iframe.sound",{
        src: "https://www.youtube.com//embed/miZHa7ZC6Z0?autoplay=1"},
        element.style({
          "position": "absolute",
          "bottom": "50px",
          "width": "150px",
          "height": "100px",
          "opacity": "0.1",
          "border": "0"}))

      var startupSound = sound("miZHa7ZC6Z0")

      var iframe = element("iframe", {src: "/sites/"+name})

      var previewId = iframe.assignId()

      var tree = bridge.defineSingleton(
        "treeSingleton",[
        bridgeModule(lib, "boot-tree", bridge),
        routeParam,
        previewId],
        function(bootTree, name, previewId) {
          return bootTree(name, previewId)
        }
      )

      var saveButton = element(
        "button",
        "Save",
        element.style({
          "background": "#ff4879",
          "color": "#e8edff",
          "padding": "10px 20px",
          "border": "none",
          "font-size": "1em",
          "display": "block",
          "margin": "1em 0",
          "cursor": "pointer"}),{
        onclick: tree.methodCall("save").evalable()})

      writeCode(partial, tree)

      bridge.send([
        iframe,
        saveButton,
        partial,
        // startupSound,
        element.stylesheet(sound)
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


