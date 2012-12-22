function log(title, data) {
  if(!data) { data = {}; }
  js = JSON.stringify(data);
  console.log("%s\n  [%s]", title, js);
}
