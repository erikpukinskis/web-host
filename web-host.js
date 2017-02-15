var library = require("module-library")(require)

module.exports = library.export(
  "web-host",
  ["web-site", "browser-bridge", "web-element"],
  function(WebSite, BrowserBridge, element) {
    
    var host = new WebSite()


    function onSite(callback) {
      var appServer = new WebSite()
      host.use(appServer.app)
      callback(appServer)
    }

    var requestCallbacks = []

    function onRequest(callback) {
      requestCallbacks.push(callback)
    }

    host.addRoute("get", "/",
      function(request, response) {

        bridge = new BrowserBridge()

        var voxels = []

        function getPartial() {
          var partial = bridge.partial()
          voxels.push(partial)
          return partial
        }

        getPartial.defineFunction = goop("defineFunction")
        getPartial.send = goop("send")
        getPartial.asap = goop("asap")

        function goop(methodName) {
          throw new Error("web-host gave you a getBridge function. You did getBridge."+methodName+", but you probably meant to get a bridge:\n        var bridge = getBridge()\n        bridge."+methodName+"(...)\nCommon mistake.")
        }

        var id = request.params.id

        requestCallbacks.forEach(
          function(callback) {
            callback(getPartial)
          }
        )

        body = element(
          ".voxels",
          element.style({
            "margin-top": "90px",
            "margin-bottom": "500px",
          }),
          voxels
        )
        
        var handler = bridge.requestHandler(body)

        handler(request, response)
      }
    )

    host.start(process.env.PORT || 1413)

    return {
      onSite: onSite,
      onRequest: onRequest,
    }

  }
)

