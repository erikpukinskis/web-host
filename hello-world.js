library.using(
  ["host-from-browser"],
  function(host) {
    host.onSite(function(site) {
      site.addRoute("get", "/", hello)
    })

    function hello(request, response) {
      response.send("HELLO WORLD")
    }
  }
)