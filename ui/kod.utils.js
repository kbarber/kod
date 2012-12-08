/**
 * Standard logging function.
 */
function log(title, data) {
  js = JSON.stringify(data);
  console.log("%s\n  [%s]", title, js);
}
