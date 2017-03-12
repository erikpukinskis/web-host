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
      try {
        throw new Error("You called web-host.onRequest here:")
      } catch(e) {
        callback.calledAtStack = e.stack
      }
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
          return function() {
            throw new Error("web-host gave you a getBridge function. You did getBridge."+methodName+", but you probably meant to get a bridge:\n        var bridge = getBridge()\n        bridge."+methodName+"(...)\nCommon mistake.")
          }
        }

        var id = request.params.id

        requestCallbacks.forEach(
          function(callback) {
            try {
              callback(getPartial)
            } catch(e) {
              console.log(callback.calledAtStack)
              throw(e)
            }
          }
        )
        
        var handler = bridge.requestHandler(voxels)

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

