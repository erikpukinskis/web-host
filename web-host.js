var library = require("module-library")(require)

module.exports = library.export(
  "web-host",
  ["web-site", "browser-bridge", "web-element", "./voxel", "show-source"],
  function(WebSite, BrowserBridge, element, Voxel, showSource) {
    
    var host = new WebSite()

    function onSite(callback) {
      var appServer = new WebSite()
      host.use(appServer.app)
      callback(appServer)
    }

    var requestCallbacks = []

    function onVoxel(callback) {
      onRequest(passVoxel.bind(null, callback))
    }

    function hostModule(lib, moduleName, arg1, arg2) {

      var args = Array.prototype.slice.call(arguments, 2)

      onVoxel(function(voxel) {
        showSource.prepareSite(voxel.getSite(), lib)

        showSource.fromLibrary(
          voxel.below(),
          lib,
          "build-a-house"
        )

        var singleton = lib.get(moduleName)

        singleton.apply(null, [voxel].concat(args))
      })
    }

    function passVoxel(callback, getBridge) {
      var bridge = getBridge()
      var voxel = new Voxel(bridge, host)
      callback(voxel)
    }

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
      onVoxel: onVoxel,
      hostModule: hostModule,
    }

  }
)

