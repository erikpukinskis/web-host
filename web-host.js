var library = require("module-library")(require)

module.exports = library.export(
  "web-host",
  ["browser-bridge", "web-site", "with-nearby-modules", "web-element"],
  function(BrowserBridge, WebSite, withNearbyModules, element) {

    var voxelTemplate = element.template.container(
      ".voxel",
      element.style({
        "width": "440px",
        "padding": "10px",
        "border": "10px solid #eee",
        "margin-top": "30px",
      })
    )

    function webHost(port) {

      var host = new WebSite()

      withNearbyModules.aModuleAppeared(
        "web-site",
        function() {
          var appServer = new WebSite()
          host.use(appServer.app)
          return appServer
        }
      )

      host.addRoute("get", "/",
        function(request, response) {
          bridge = new BrowserBridge()
          bridge.addToHead(element.stylesheet(voxelTemplate))

          var voxels = []
          withNearbyModules.aModuleAppeared(
            "browser-bridge",
            function() {
              var partial = bridge.partial()
              voxels.push(voxelTemplate(partial))
              return partial
            }
          )

          voxels = element(
            ".voxels",
            element.style({
              "margin-top": "90px"
            }),
            voxels
          )
          
          bridge.requestHandler(voxels)(request, response)
        }
      )

      host.start(port || process.env.PORT || 1413)
    }

    return webHost
  }
)


