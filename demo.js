var library = require("module-library")(require)

library.using(
  ["./", "web-element"],
  function(host, element) {

    host.onRequest(function(getBridge) {
      var bridge = getBridge()
      bridge.send("Hello, world")
    })

    host.onSite(function(site) {

      site.addRoute(
        "get",
        "/bye",
        function(request, response) {
          response.send("Y'all have a nice day now")
        }
      )
    })

    // site should be started now. check your terminal for the address

  }
)

