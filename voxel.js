var library = require("module-library")(require)

module.exports = library.export(
  "voxel",
  ["web-element", "identifiable", "web-site"],
  function(element, identifiable, WebSite) {

    var voxels = {}

    function Voxel(bridge, host, base, direction) {

      this.host = host
      this.bridge = bridge
      this.base = base
      this.__isNrtvBrowserBridge = true
      this.children = []
      this.neighborhood = []
      this.direction = direction
      this.selectors = []

      if (!voxels[bridge.id]) {
        voxels[bridge.id] = {}
      }
      this.bridgeVoxels = voxels[bridge.id]
      identifiable.assignId(this.bridgeVoxels, this)
      this.bridgeVoxels[this.id] = true

      if (!base) {
        defineOn(bridge)
      }

      passMethodsThrough(this, bridge, ["defineFunction", "defineSingleton", "remember", "see", "addToHead", "partial", "asap"])
    }

    Voxel.prototype.getSite = function() {
      if (this.site) {
        return this.site
      } else if (this.host) {
        this.site = new WebSite()
        this.host.use(this.site.app)
        return this.site
      } else if (this.base) {
        return this.base.getSite()
      } else {
        throw new Error("no host")
      }
    }

    Voxel.prototype.selector = function() {
      if (this.elementId) {
        // already assigned an id
      } else if (this.el) {
        this.elementId = this.el.assignId()
      } else {
        this.elementId = element().assignId()
      }

      return "#"+this.elementId
    }

    Voxel.prototype.toggle = function() {
      return bridge.remember("voxel/toggleBehind").withArgs(this.id)
    }

    Voxel.prototype.left = function(options) {
      return newBaby(this, "left", options)
    }

    Voxel.prototype.below = function(options) {
      var vox = newBaby(this, null, options)
      vox.direction = "below"
      return vox
    }

    function newBaby(voxel, direction, options) {
      var baby = new Voxel(voxel.bridge.partial(), null, voxel, direction)

      if (options && options.open) {
        voxel.selectors.push(".double")
        baby.selectors.push(".open")
      }

      if (direction == "left") {
        voxel.children.push(baby)
      } else {
        voxel.neighborhood.push(baby)
      }

      return baby
    }

    Voxel.prototype.element = function(content) {

      if (this.el) {
        throw new Error("already rendered voxel!")
      }

      if (this.base) {
        content = [this.bridge]
      } else if (!content) {
        content = []
      } else if (!Array.isArray(content)) {
        content = [content]
      }

      var content = this.children.map(voxelToElement).concat(content, this.neighborhood.map(voxelToElement))

      if (content.length == 1) {
        content = content[0]
      }

      var el = element(".voxel", content)
      el.id = this.elementId

      if (this.direction) {
        el.addSelector(".voxel-"+this.direction)
      }

      el.addSelector(".voxel-"+this.id)
      this.selectors.forEach(function(selector) {
        el.addSelector(selector)
      })

      if (!this.base) {
        el = element(".channel", el)
      }

      this.el = el

      return el
    }

    function voxelToElement(voxel) {
      return voxel.element()
    }

    Voxel.prototype.send = function(content) {
      if (this.base) {
        this.bridge.send(content)
      } else {
        this.bridge.send(this.element(content))
        delete voxels[this.bridge.id]
      }
    }

    function passMethodsThrough(instance, targetObject, methods) {

      methods.forEach(function(method) {
        instance[method] = targetObject[method].bind(targetObject)
      })
    }

    function defineOn(bridge) {
      if (bridge.remember("voxel/toggleBehind")) { return }

      bridge.addToHead(stylesheet)

      var toggle = bridge.defineFunction(
        [{}],
        function toggleBehind(voxels, id, callback) {
          toggleClass(".voxel-left", "open")
          toggleClass(".channel", "double")

          if (!voxels[id]) {
            var voxel = {
              id: id,
              send: sendContentToVoxel.bind(null, id),
            }
            voxels[id] = voxel
          }

          function sendContentToVoxel(id, html) {
            var node = document.querySelector(".voxel-"+id)
            node.innerHTML = html
          }

          callback && callback(voxels[id])

          function toggleClass(selector, className) {
            var node = document.querySelector(selector)
            var hasClass = node.classList.contains(className) 
            node.classList[hasClass ? "remove" : "add"](className)
          }
        }
      )

      bridge.see("voxel/toggleBehind", toggle)
    }

    var speed = "75ms"

    var stylesheet = element.stylesheet([
      element.style("body", {
        "margin": "0",
        "padding": "0",
      }),

      element.style(".channel", {
        "position": "absolute",
        "background": "#fefeff",
        "transition": "transform "+speed,
        "right": "0",
        "margin": "50px 5%",
      }),

      element.style(".voxel.double", {
        "@media (min-width: 500px)": {
          "max-width": "50%",
        }
      }),

      element.style(".voxel", {
        "position": "relative",
        "z-index": "1",
      }),

      element.style(".voxel-left", {
        "float": "left",
        "width": "80%",
        "transition": "margin-left "+speed+", margin-right "+speed+", opacity "+speed,
        "opacity": "0",
        "z-index": "0",
        "display": "none",

        "@media (min-width: 500px)": {
          "display": "block",
          "margin-right": "-80%",
        }
      }),

      element.style(".voxel-left.open", {
        "margin-right": "0%",
        "opacity": "0.8",
        "display": "block",

        "@media (min-width: 500px)": {
          "margin-left": "-80%",
        }
      }),

      element.style("h1, p", {
        "max-width": "25em",
      }),
    ])

    Voxel.defineOn = defineOn


    return Voxel
  }
)
