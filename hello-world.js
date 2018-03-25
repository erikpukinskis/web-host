
appearedAWild(
  "browser-bridge",
  function(bridge) {
    bridge.send("hello, world")})


appearedAWild([
  "browser-bridge"],
  function(bridge) {
    bridge.send("hello, world")})


defineFunction(
  "hello-world",
  ["one:browser-bridge"],
  function(bridge) {
    bridge.send(
      "hello, world!")})

nameFunction(
  ..

nameSomething(
  "hello-world",
  ["one:browser-bridge"],
  function(bridge) {
    bridge.send(
      "hello, world!")})

nameFunction.andRun(
  "hello-world",
  ["one:browser-bridge"],
  function(bridge) {
    bridge.send(
      "hello, world!")})

defineModule(
  "hello-world",
  ["one:browser-bridge"],
  function(bridge) {
    bridge.send(
      "hello, world!")})


library.define(
  "hello-world",
  ["appeared-a-wild", "web-element"],
  function(appearedAWild, webElement) {
    appearedAWild(
      "browser-bridge",
      function(bridge) {
        bridge.send(
          webElement(
          "hello, world"))})


library.using(
  ["#browser-bridge"],
  function(bridge) {
    bridge.send("hello, world")})


library.using(
  ["a browser-bridge"],
  function(bridge) {
    bridge.send("hello, world")})


nameFunction(
  "hello-world",[
  "appeared-a-wild",
  "web-element"],
  function (whenItAppears, webElement){
    var heading = webElement(
      "h1",
      "hello, world!")
    whenItAppears([
      "browser-bridge"],
      function(bridge){
        bridge.send(heading)})


function helloWorld(whenItAppears, webElement){
  var heading = webElement(
    "h1",
    "hello, world!")
  whenItAppears([
    "browser-bridge"],
    function(bridge){
      bridge.send(heading)})






/////////////////////////////////////

library.define(
  "hello-world",[
  "appeared-a-wild",
  "web-element"],
  function (appearedAWild, webElement){
    var heading = webElement(
      "h1",
      "hello, world!")
    appearedAWild([
      "browser-bridge"],
      function (bridge){
        bridge.send(heading)})

/////////////////////////////////////








