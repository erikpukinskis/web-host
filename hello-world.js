// hello-world.js

appearedAWild(
  "browser-bridge",
  function(bridge) {
    var form = webElement(
    bridge.send("HELLO WORLD")})}


// basic-site.js

function helloWorld(appearedAWild, functionCallLog, webElement, askFor) {

  // Basic persistence:

  var messages = []

  function hello(message) {
    messages.push(message)
  }

  var log = functionCallLog({
    hello: hello
  })

  appearedAWild(
    "web-site",
    function(site) {
      site.addRoute(
        "post",
        "/hellos",
        log.request())


  // Load from cloud:

  log.persistToS3(
    askForInfo(
      "Enter the s3 credentials for the hello store"))

  log.replayRemote()


  // Form:

  var input = webElement(
    "input",{
    type: "text",
    placeholder: "Type your hello and press enter",
    name: "message"})

  var form = webElement(
    "form",{
    method: "post",
    action: "/hellos"},
    input)

  var item = webElement.template(
    "li")

  var title = webElement(
    "h1",
    "HELLO WORLD!")


  // Handling requests:

  appearedAWild(
    "browser-bridge",
    function(bridge) {
      var list = webElement(
        "ul",
        messages.map(item))

      bridge.send([
        title,
        list,
        form])})

}
