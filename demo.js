var library = require("module-library")(require)


library.using(
  ["./", "web-element", "./voxel", "make-request"],
  function(host, element, Voxel, makeRequest) {

    host.onSite(function(site) {

      site.addRoute(
        "get",
        "/web-host/partials/code",
        function(x, response) {
          response.send("program<br>code<br>goes<br>here")
        }
      )

    })

    host.onVoxel(function(channel) {

      // Where the code will end up:

      var code = channel.left()
      code.send("loading...")


      // Button for loading the code:

      var buttons = channel.below()

      var loadCode = bridge.defineFunction(
        [makeRequest.defineOn(bridge)],
        function(makeRequest, voxel) {
          if (voxel.wasLoaded) { return }

          makeRequest("/web-host/partials/code", function(html) {
            voxel.send(html)
          })

          voxel.wasLoaded = true
        }
      )

      var showSourceButton = element(
        "button",
        {onclick: code.toggle().withArgs(loadCode).evalable()},
        "Show source"
      )

      channel.addToHead(
        element.stylesheet(
          element.style("button", {
            "padding": "10px",
            "font-size": "1em",
            "border": "0",
            "background": "#e91e63",
            "color": "white",
          })
        )
      )

      buttons.send(showSourceButton)


      // Main column content:

      var pitch = channel.below()
      pitch.send([
        element("h1", "Dear friends,"),
        element("p", "I'm starting a tiny house building business. I have built two prototypes, and made very detailed plans. I would like to build one for sale."),
      ])


      // Finish the request:

      channel.send()

    })

  }
)

