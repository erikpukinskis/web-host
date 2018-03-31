var library = require("module-library")(require)


// Where does this go?


//    var callbacksWaiting = []
//    var listenersWaiting = []
//
//    function onSite(callback) {
//      if (listenersWaiting.length > 0) {
//        bindListener(listenersWaiting.pop(), callback)
//      } else {
//        callbacksWaiting.push(callback)
//      }
//    }
//
//    function listen(listenToSocket) {
//      if (callbacksWaiting.length > 0) {
//        bindListener(listenToSocket, callbacks.pop())
//      } else {
//        listenersWaiting.push(listenToSocket)
//      }
//    }




module.exports = library.export(
  "server-runner-page",
  [library.ref(), "browser-bridge", "get-socket", "nrtv-single-use-socket", "make-request", "./web-site-in-browser", "bridge-module", "web-element"],
  function(lib, BrowserBridge, getSocket, SingleUseSocket, WebSiteInBrowser, bridgeModule, element) {

    var siteSockets = {}
    var sourceGetters = {}

    function serverRunnerPage(bridge, siteId, getSource) {

      ensureValidSite(siteId)

      if (siteSockets[siteId]) {
        throw new Error("Already served that site from somewhere else")
      }

      siteSockets[siteId] = new SingleUseSocket(baseServer)

      sourceGetters[siteId] = getSource

      bridge.asap([
        bridgeModule(
          lib,
          "web-site-in-browser",
          bridge),
        siteSockets[siteId]
        .defineListenOn(
          bridge)],
        function(handleRequestsInBrowser, listenForRequests) {

          var site = WebSiteInBrowser(listenForRequests)

          waitForScriptAndPassInSite(site)})

      bridge.addToHead(
        element("script", {src: "/servers/"+siteId+".js"}).html())

      bridge.send("<h1>Running server "+siteId+"...</h1>")

    }

    function prepareSite(baseServer, getSource, name) {
      sourceGetters[name] = getSource
      if (baseServer.remember("web-host/site-server")) {
        return
      }

      getSocket.handleConnections(
        baseServer,
        function(connection, next) {
          throw new Error("Wayward socket")
        }
      )

      SingleUseSocket.installOn(baseServer)

      baseServer.addRoute("get", "/servers/:siteId.js", function(request, response) {
        var siteId = request.params.siteId
        ensureValidSite(siteId)
        response.send(sites.getSource(siteId))
      })

      function ensureValidSite(siteId) {
        if (typeof siteId != "string") {
          throw new Error("site id "+siteId+" is not a string")
        } else if (siteId.match(/[^0-9a-zA-Z-]/)) {
          throw new Error("site id "+siteId+" has stuff other than letters, numbers, and dashes")
        } else if (!sites.getSource(siteId)) {
          throw new Error("No source for site "+siteId)
        }
      }

      responses = {}

      baseServer.addRoute("post", "/responses/:requestId", function(request, response) {
        var requestId = request.params.requestId
        responses[requestId].send(request.body.body)
        delete(responses[requestId])
        response.send({status: "ok"})
      })

      var lastRequestId = 0
      
      baseServer.use(function(request, response, next) {

        var path = request.path
        var parts = request.path.match(/^\/sites\/([0-9a-zA-Z-]+)(\/.*)$/)
        if (!parts) {
          return next()
        }
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

      baseServer.see("web-host/site-server", true)

    }

    serverRunnerPage.prepareSite = prepareSite

    return serverRunnerPage
  }
)