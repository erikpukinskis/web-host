var library = require("module-library")(require)

// createBrowserContext for security: 
//  https://chromedevtools.github.io/devtools-protocol/tot/Target/#method-createBrowserContext
// https://github.com/cyrus-and/chrome-remote-interface/issues/118

library.using(
  ["puppeteer", "web-site", "browser-bridge", "get-socket", "nrtv-single-use-socket", "make-request"],
  function(puppeteer, WebSite, BrowserBridge, getSocket, SingleUseSocket, makeRequest) {

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

    serverServer.addRoute("get", "/servers/one", function(request, response) {

      var socket = serverSockets.one = new SingleUseSocket(serverServer)

      var bridge = new BrowserBridge()

      bridge.asap(
        [socket.defineListenOn(bridge), makeRequest.defineOn(bridge)],
        function(listen, makeRequest) {

          listen(function(message) {
            var data = JSON.parse(message)

            var requestId = parseInt(data.requestId)

            makeRequest({
              method: "post",
              path: "/responses/"+requestId,
              data: {
                body: "HELLO WORLD"
              }
            })
          })

        }
      )

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

      serverSockets.one.send(JSON.stringify({requestId: requestId}))
    })


    var launchedBrowser

    serverServer.addRoute("get", "/kill", function(request, response) {
      response.send("dying...")
      setTimeout(function() {
        launchedBrowser && launchedBrowser.close()
        serverServer.stop()
      })
    })

    puppeteer.launch().then(function(browser) {
      launchedBrowser = browser

      browser.newPage().then(loadServerOne)

      function loadServerOne(page) {
        page.goto("http://localhost:3002/servers/one").then(done)
      }

      function done() {
        console.log("browser launched.")
      }
    })

  }
)
