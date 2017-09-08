var library = require("module-library")(require)

module.exports = library.export(
  "host-from-browser",
  ["make-request", "./url-pattern"],
  function(makeRequest, UrlPattern) {

    var callbacksWaiting = []
    var listenersWaiting = []

    function onSite(callback) {
      if (listenersWaiting.length > 0) {
        bindListener(listenersWaiting.pop(), callback)
      } else {
        callbacksWaiting.push(callback)
      }
    }

    function listen(listenToSocket) {
      if (callbacksWaiting.length > 0) {
        bindListener(listenToSocket, callbacks.pop())
      } else {
        listenersWaiting.push(listenToSocket)
      }
    }

    function SocketSite() {
      this.patterns = []
      this.handlers = []
      this.verbs = []
    }

    SocketSite.prototype.addRoute = function(verb, pattern, handler) {
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

    SocketSite.prototype.handleRequest = function(message) {
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

      throw new Error("No routes match "+path)
    }

    function sendResponse(requestId, body) {
      makeRequest({
        method: "post",
        path: "/responses/"+requestId,
        data: {
          body: body
        }
      })
    }

    function bindListener(listenToSocket, callback) {
      var site = new SocketSite()
      callback(site)
      listenToSocket(site.handleRequest.bind(site))
    }

    return {
      onSite: onSite,
      listen: listen,
    }
  }
)

