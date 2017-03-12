var library = require("module-library")(require)

module.exports = library.export(
  "voxel",
  ["web-element"],
  function(element) {

    function Voxel(bridge, base, direction) {

      if (!base) {
        defineOn(bridge)
      }
      this.bridge = bridge
      this.base = base
      this.__isNrtvBrowserBridge = true
      this.children = []
      this.neighborhood = []
      this.direction = direction

      passMethodsThrough(this, bridge, ["defineFunction", "defineSingleton", "remember", "see", "addToHead", "partial"])
    }

    Voxel.prototype.toggle = function() {
      return bridge.remember("voxel/toggleBehind")
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
      var baby = new Voxel(voxel.bridge.partial(), voxel, direction)

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
      if (this.selector) {
        el.addSelector(this.selector)
      }

      if (this.direction) {
        el.addSelector(".voxel-"+this.direction)
      }

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
        function toggle() {
          toggleClass(".voxel-left", "open")
          toggleClass(".channel", "double")

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
        "font-family": "sans-serif",
        "margin": "0",
        "padding": "0",
      }),

      element.style(".channel", {
        "position": "absolute",
        "background": "#fefeff",
        "transition": "transform "+speed,
        "max-width": "500px",
        "right": "0",
        "margin": "50px 5%",
      }),

      element.style(".channel.double", {
        "@media (min-width: 500px)": {
          "max-width": "50%",
        }
      }),

      element.style(".voxel-place-holder", {
        "position": "\"relative\"",
      }),


      element.style(".voxel", {
        "position": "relative",
        "z-index": "1",
      }),

      element.style(".voxel-left", {
        "float": "left",
        "width": "80%",
        "transition": "margin-left "+speed+", margin-right "+speed+", opacity "+speed,
        "background": "black",
        "color": "white",
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
