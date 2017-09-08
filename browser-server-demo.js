var library = require("module-library")(require)

// createBrowserContext for security: 
//  https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-createBrowserContext
// https://github.com/cyrus-and/chrome-remote-interface/issues/118

// Streaming HTTP server interfaces:
// http://www.apachetutor.org/dev/brigades
// https://hexdocs.pm/raxx/Raxx.html

library.define(
  "host-from-browser",
  ["make-request", "./url-pattern"],
  function(makeRequest, UrlPattern) {

    var callbacksWaiting = []
    var listenersWaiting = []

    function onSite(callback) {
      if (listenersWaiting.length > 0) {
        bindListener(listenersWaiting.pop(), callback)
      } else {
        callbacksWaiting.push(callback)
      }
    }

    function listen(listenToSocket) {
      if (callbacksWaiting.length > 0) {
        bindListener(listenToSocket, callbacks.pop())
      } else {
        listenersWaiting.push(listenToSocket)
      }
    }

    function SocketSite() {
      this.patterns = []
      this.handlers = []
      this.verbs = []
    }

    SocketSite.prototype.addRoute = function(verb, pattern, handler) {
      verb = verb.toLowerCase()
      if (verb != "get" && verb != "post") {
        throw new Error("First argument to webSite.addRoute should be an HTTP verb, either \"get\" or \"post\"")
      } else if (typeof pattern != "string") {
        throw new Error("Second argument to webSite.addRoute should be a path pattern")
      } else if (typeof handler != "function") {
        throw new Error("Third argument to webSite.addRoute should be a handler function that takes a request and a response")
      }

      this.verbs.push(verb)
      this.patterns.push(new UrlPattern(pattern))
      this.handlers.push(handler)
    }

    SocketSite.prototype.handleRequest = function(message) {
      var data = JSON.parse(message)

      var requestId = parseInt(data.requestId)
      var path = data.path
      var verb = data.verb

      for(var i=0; i<this.patterns.length; i++) {
        if (this.verbs[i] != verb) {
          continue
        }
        var params = this.patterns[i].match(path)
        if (params) {
          handler = this.handlers[i]
          var request = {params: params}
          var response = {send: sendResponse.bind(null, requestId)}
          return handler(request, response)
        }
      }

      throw new Error("No routes match "+path)
    }

    function sendResponse(requestId, body) {
      makeRequest({
        method: "post",
        path: "/responses/"+requestId,
        data: {
          body: body
        }
      })
    }

    function bindListener(listenToSocket, callback) {
      var site = new SocketSite()
      callback(site)
      listenToSocket(site.handleRequest.bind(site))
    }

    return {
      onSite: onSite,
      listen: listen,
    }
  }
)

library.define(
  "site-server",
  [library.ref(), "browser-bridge", "get-socket", "nrtv-single-use-socket", "make-request", "host-from-browser", "bridge-module", "web-element"],
  function(lib, BrowserBridge, getSocket, SingleUseSocket, makeRequest, hostFromBrowser, bridgeModule, element) {

    function SiteServer(baseServer) {
      this.sockets = {}
      this.sources = {}

      defineOn(baseServer, this)
    }

    SiteServer.prototype.host = function(siteId, source) {
      this.sources[siteId] = source
    }

    function defineOn(baseServer, sites) {

      getSocket.handleConnections(
        baseServer,
        function(connection, next) {
          throw new Error("Wayward socket")
        }
      )

      SingleUseSocket.installOn(baseServer)

      baseServer.addRoute("get", "/sites/:siteId.js", function(request, response) {
        var siteId = request.params.siteId
        ensureValidSite(siteId)
        response.send(sites.sources[siteId])
      })

      function ensureValidSite(siteId) {
        if (typeof siteId != "string") {
          throw new Error("site id "+siteId+" is not a string")
        } else if (siteId.match(/[^0-9a-zA-Z-]/)) {
          throw new Error("site id "+siteId+" has stuff other than letters, numbers, and dashes")
        } else if (!sites.sources[siteId]) {
          throw new Error("No source for site "+siteId)
        }
      }

      baseServer.addRoute("get", "/servers/:siteId", function(request, response) {

        var siteId = request.params.siteId
        ensureValidSite(siteId)

        var socket = sites.sockets[siteId] = new SingleUseSocket(baseServer)

        var bridge = new BrowserBridge()

        bridge.asap(
          [bridgeModule(lib, "host-from-browser", bridge), socket.defineListenOn(bridge)],
          function(siteHost, listenToSocket) {
            siteHost.listen(listenToSocket)
          }
        )

        bridge.addToHead(
          element("script", {src: "/sites/"+siteId+".js"}).html())

        bridge.forResponse(response).send()
      })

      responses = {}

      baseServer.addRoute("post", "/responses/:requestId", function(request, response) {
        var requestId = request.params.requestId
        responses[requestId].send(request.body.body)
        delete(responses[requestId])
        response.send({status: "ok"})
      })

      var lastRequestId = 0

      baseServer.addRoute("get", "/kill", function(request, response) {
        response.send("dying...")
        setTimeout(function() {
          launchedBrowser && launchedBrowser.close()
          baseServer.stop()
        })
      })
      
      baseServer.use(function(request, response, next) {

        var path = request.path
        var parts = request.path.match(/^\/sites\/([0-9a-zA-Z-]+)(\/.*)$/)
        var siteId = parts[1]
        var path = parts[2]

        lastRequestId++
        var requestId = lastRequestId
        responses[requestId] = response

        var miniRequest = {
          requestId: requestId,
          path: path,
          verb: request.method.toLowerCase(),
        }

        sites.sockets[siteId].send(JSON.stringify(miniRequest))
      })

      var launchedBrowser

    }

    return SiteServer
  }
)

library.using(
  ["puppeteer", "web-site", "fs", "site-server"],
  function(puppeteer, WebSite, fs, SiteServer) {

    var baseSite = new WebSite()

    var sites = new SiteServer(baseSite)
    sites.host("hello-world", fs.readFileSync("hello-world.js"))

    baseSite.start(3002)

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
