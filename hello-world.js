// hello-world.js, appeared-a-wild remix

appearedAWild(
  "web-site",
  function(site) {
    site.addRoute(
      "get",
      "/")})

appearedAWild(
  "browser-bridge",
  function(bridge) {
    bridge.send("HELLO WORLD")})
