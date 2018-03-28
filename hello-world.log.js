anExpression.addLine({
  "id": "hndlr-1",
  "kind", "function call"})
anExpression.addChild(
  "hndlr-1",{
  id: "wit-2",
  kind: "function call",
  functionName: "withSite"})
anExpression.addExpression({
  id: "sthnd-3".
  kind: "function literal"})
anExpression.setProperty(
  "wit-2",
  "arguments",
  "sthnd-3")
anExpression.addChild(
  "sthnd-3",{
  id: "adrt-4",{
  kind: "function call",
  functionName: "site.addRoute"})
anExpression.addChild(
  "adrt-4",{
  kind: "string literal",
  string: "get"})
anExpression.addChild(
  "adrt-4",{
  kind: "string literal",
  string: "/"})
anExpression.addLine({
  id: "wit-br",
  kind: "function call",
  functionName: "withBridge"})
anExpression.addChild(
  "wit-br", {
  id: "brg-hn",
  kind: "function literal"})
anExpression.setProperty(
  "brg-hn",{
  arguments: "bridge"})
anExpression.addChild(
  "brg-hn",{
  id: "snd-1",
  kind: "function call",
  functionName: "bridge.send"})
anExpression.addChild(
  "send-1",{
  kind: "string literal",
  string: "HELLO WORLD"})