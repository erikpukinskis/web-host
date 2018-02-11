var library = require("module-library")(require)

module.exports = library.export(
  "site-server",
  [library.ref(), "browser-bridge", "get-socket", "nrtv-single-use-socket", "make-request", "./host-from-browser", "bridge-module", "web-element"],
  function(lib, BrowserBridge, getSocket, SingleUseSocket, makeRequest, hostFromBrowser, bridgeModule, element) {

    function SiteServer(baseServer) {
      this.sockets = {}
      this.sources = {}

      this.prepareSite(baseServer)
    }

    SiteServer.prototype.host = function(siteId, source) {
      this.sources[siteId] = source
    }

    SiteServer.prototype.prepareSite = function(baseServer) {

      var sites = this

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

      var launchedBrowser

    }

    return SiteServer
  }
)