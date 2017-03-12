var library = require("module-library")(require)


library.using(
  ["web-host", "web-element", "./voxel"],
  function(host, element, Voxel) {

    host.onRequest(function(getBridge) {
      var bridge = getBridge()

      var channel = new Voxel(bridge)

      var code = channel.left()

      code.send("program<br>code<br>goes<br>here")

      var buttons = channel.below()

      var showSourceButton = element(
        "button",
        element.style({
          "padding": "10px",
          "font-size": "1em",
          "border": "0",
        }),
        {onclick: code.toggle().evalable()},
        "Show source"
      )

      buttons.send(showSourceButton)

      var pitch = channel.below()
      pitch.send([
        element("h1", "Dear friends,"),
        element("p", "I'm starting a tiny house building business. I have built two prototypes, and made very detailed plans. I would like to build one for sale."),
      ])


      channel.send()
    })


  }
)

