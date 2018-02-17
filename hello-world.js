// hello-world.js

appearedAWild(
  "browser-bridge",
  function(bridge) {
    var form = webElement(
    bridge.send("hello, world")})}



// basic-site.js

function postHello(appearedAWild, functionCallLog, webElement, askForPlaintext) {

  // PERSISTENCE

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


  // LOAD FROM CLOUD

  log.persistToS3(
    askForPlaintext(
      "10jcsw58plnbyr3wdvjii7863wsxvh",
      "Enter the s3 credentials for the hello store"))

  log.replayRemote()


  // WEB FORM

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
    "HELLO POST")


  // HANDLE REQUESTS

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
