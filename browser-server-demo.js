var library = require("module-library")(require)


library.using(
  ["puppeteer", "web-site", "fs", "./site-server", "tell-the-universe", "javascript-to-ezjs", "show-source", "an-expression"],
  function(puppeteer, WebSite, fs, SiteServer, aWildUniverseAppeared, javascriptToEzjs, showSource, anExpression) {



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

    baseSite.start(3002)




    
    // Hello, world!

    var source = fs.readFileSync("./a-panel-bond.js").toString()

    sites.host("a-panel-bond", source)

    var universe = aWildUniverseAppeared("a-panel-bond-codes", {anExpression: "an-expression"})
    
    var tree = anExpression.tree()
    universe.do("anExpression.tree", tree.id)
    tree.logTo(universe)
    javascriptToEzjs(source, tree)

    baseSite.addRoute("get", "/edit/:siteId", function(request, response) {
      var bridge = new BrowserBridge()

      var partial = bridge.partial()

      showSource.prepareBridge(partial)
      
      showSource(partial, "./a-panel-bond", lib)

      // renderExpression(partial, tree.rootId(), tree)

      var iframe = element("iframe", {src: "/sites/"+siteId})
      bridge.forResponse(response).send([
        iframe,
        partial
      ])

    })


    // Get a server server:

    puppeteer.launch().then(function(browser) {
      launchedBrowser = browser

      browser.newPage().then(loadServerOne)

      function loadServerOne(page) {
        page.goto("http://localhost:3002/servers/hello-world").then(done)
      }

      function done() {
        console.log("browser launched. Visit http://localhost:3002/sites/hello-world/")
        console.log("\nhttp://localhost:3002/kill to kill")
      }
    })

  }
)




// createBrowserContext for security: 
//  https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-createBrowserContext
// https://github.com/cyrus-and/chrome-remote-interface/issues/118

// Streaming HTTP server interfaces:
// http://www.apachetutor.org/dev/brigades
// https://hexdocs.pm/raxx/Raxx.html


