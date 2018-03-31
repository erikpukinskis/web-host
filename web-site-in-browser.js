var library = require("module-library")(require)



// This file will almost certainly move into web-site


// It maybe will become similar to module-library where there is web-site.js and node-web-site.js, plus browser-web-site.js.

// ... which module-library doesn't have, but I think maybe bridge-module becomes that and moves into module-library.




module.exports = library.export(
  "web-site-in-browser",
  ["make-request", "./url-pattern"],
  function(makeRequest, UrlPattern) {

    // This is running in the browser!

    function handleRequestsInBrowser(listenForRequests) {
      // booted up with a listen function that gets requests sent from the baseServer
    }

    function WebSiteInBrowser() {
      this.patterns = []
      this.handlers = []
      this.verbs = []

      this.handleRequest = this.handleRequest.bind(this)
    }

    WebSiteInBrowser.prototype.addRoute = function(verb, pattern, handler) {
      verb = verb.toLowerCase()
      if (verb != "get" && verb != "post") {
        throw new Error("First argument to webSite.addRoute should be an HTTP verb, either \"get\" or \"post\"")
      } else if (typeof pattern != "string") {
        throw new Error("Second argument to webSite.addRoute should be a path pattern")
      } else if (typeof handler != "function") {
        throw new Error("Third argument to webSite.addRoute should be a handler function that takes a request and a response")
      }

      this.verbs.push(verb)
      this.patterns.push(new UrlPattern(pattern))
      this.handlers.push(handler)
    }

    WebSiteInBrowser.prototype.handleRequest = function(message) {
      var data = JSON.parse(message)

      var requestId = parseInt(data.requestId)
      var path = data.path
      var verb = data.verb

      for(var i=0; i<this.patterns.length; i++) {
        if (this.verbs[i] != verb) {
          continue
        }
        var params = this.patterns[i].match(path)
        if (params) {
          handler = this.handlers[i]
          var request = {params: params}
          var response = {send: sendResponse.bind(null, requestId)}
          return handler(request, response)
        }
      }

      throw new Error("No routes match "+path)}

    function sendResponse(requestId, body) {
      makeRequest({
        method: "post",
        path: "/responses/"+requestId,
        data: {
          body: body
        }})
    }

    return WebSiteInBrowser})
