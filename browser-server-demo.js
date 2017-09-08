var library = require("module-library")(require)

// createBrowserContext for security: 
//  https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-createBrowserContext
// https://github.com/cyrus-and/chrome-remote-interface/issues/118

// Streaming HTTP server interfaces:
// http://www.apachetutor.org/dev/brigades
// https://hexdocs.pm/raxx/Raxx.html

library.define(
  "site-host",
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
          handler(request, response)
        }
      }

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


library.using(
  [library.ref(), "puppeteer", "web-site", "browser-bridge", "get-socket", "nrtv-single-use-socket", "make-request", "site-host", "bridge-module", "web-element"],
  function(lib, puppeteer, WebSite, BrowserBridge, getSocket, SingleUseSocket, makeRequest, siteHost, bridgeModule, element) {

    var serverServer = new WebSite()

    getSocket.handleConnections(
      serverServer,
      function(connection, next) {
        throw new Error("Wayward socket")
      }
    )

    SingleUseSocket.installOn(serverServer)

    serverServer.start(3002)

    var serverSockets = {}

    serverServer.addRoute("get", "/sites/one.js", serverServer.sendFile(__dirname, "site-one.js"))

    serverServer.addRoute("get", "/servers/:serverId", function(request, response) {

      var serverId = request.params.serverId

      var socket = serverSockets.one = new SingleUseSocket(serverServer)

      var bridge = new BrowserBridge()

      bridge.asap(
        [bridgeModule(lib, "site-host", bridge), socket.defineListenOn(bridge)],
        function(siteHost, listenToSocket) {
          siteHost.listen(listenToSocket)
        }
      )

      bridge.addToHead(
        element("script", {src: "/sites/"+serverId+".js"}).html())

      bridge.forResponse(response).send()
    })

    responses = {}

    serverServer.addRoute("post", "/responses/:requestId", function(request, response) {
      var requestId = request.params.requestId
      responses[requestId].send(request.body.body)
      delete(responses[requestId])
      response.send({status: "ok"})
    })

    var lastRequestId = 0

    serverServer.addRoute("get", "/sites/one", function(request, response) {

      lastRequestId++
      var requestId = lastRequestId
      responses[requestId] = response

      var miniRequest = {
        requestId: requestId,
        path: request.path.slice(10),
        verb: request.method.toLowerCase(),
      }

      debugger
      console.log(JSON.stringify(miniRequest, null, 2))

      serverSockets.one.send(JSON.stringify(miniRequest))
    })

    var launchedBrowser

    serverServer.addRoute("get", "/kill", function(request, response) {
      response.send("dying...")
      setTimeout(function() {
        launchedBrowser && launchedBrowser.close()
        serverServer.stop()
      })
    })

    // puppeteer.launch().then(function(browser) {
    //   launchedBrowser = browser

    //   browser.newPage().then(loadServerOne)

    //   function loadServerOne(page) {
    //     page.goto("http://localhost:3002/servers/one").then(done)
    //   }

    //   function done() {
    //     console.log("browser launched.")
    //   }
    // })

  }
)
