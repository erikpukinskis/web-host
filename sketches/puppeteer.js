var library = require("module-library")(require)

// createBrowserContext for security: 
//  https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-createBrowserContext
// https://github.com/cyrus-and/chrome-remote-interface/issues/118

// Streaming HTTP server interfaces:
// http://www.apachetutor.org/dev/brigades
// https://hexdocs.pm/raxx/Raxx.html


library.using(
  ["puppeteer", "web-site", "fs", "./site-server"],
  function(puppeteer, WebSite, fs, SiteServer) {

    var baseSite = new WebSite()
    baseSite.start(3002)


    var sites = new SiteServer(baseSite)
    
    sites.host("hello-world", fs.readFileSync("hello-world.js"))


    var launchedBrowser

    baseSite.addRoute("get", "/kill", function(request, response) {
      response.send("dying...")
      setTimeout(function() {
        launchedBrowser && launchedBrowser.close()
        baseSite.stop()
      })
    })

    // createBrowserContext for security: 
    //  https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-createBrowserContext
    // https://github.com/cyrus-and/chrome-remote-interface/issues/118

    // Streaming HTTP server interfaces:
    // http://www.apachetutor.org/dev/brigades
    // https://hexdocs.pm/raxx/Raxx.html

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
