;(function () {
  var pathname = window.location.pathname
  var locationPath = pathname.substring(0, pathname.lastIndexOf('/'))
  require.config({
    urlArgs: 'v=7.0.8',
    baseUrl: locationPath,
    paths: {
      scripts: 'scripts',
      lib: 'lib',
    },
  })
})()
