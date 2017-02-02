var library = require("module-library")(require)

module.exports = library.export(
  "web-host",
  ["web-site", "browser-bridge", "web-element"],
  function(WebSite, BrowserBridge, element) {

    var voxelTemplate = element.template.container(
      ".voxel",
      element.style({
        "max-width": "440px",
        "padding": "10px",
        "border": "10px solid #eee",
        "margin-top": "30px",
      })
    )

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
        bridge.addToHead(element.stylesheet(voxelTemplate))

        var voxels = []

        function getPartial() {
          var partial = bridge.partial()
          voxels.push(voxelTemplate(partial))
          return partial
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

