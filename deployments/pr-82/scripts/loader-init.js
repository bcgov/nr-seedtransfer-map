// Monkeypatch the missing reposition method on HTMLElement prototype to prevent
// internal Calcite Components / Stencil asynchronous upgrade race condition crashes
// where Esri CDN code calls popoverEl?.value?.reposition() before the element is fully upgraded.
if (typeof HTMLElement.prototype.reposition !== 'function') {
  HTMLElement.prototype.reposition = function () {
    console.debug('Calcite Components custom element reposition placeholder called.')
  }
}

;(function () {
  var pathname = window.location.pathname
  var locationPath = pathname.substring(0, pathname.lastIndexOf('/'))
  window.dojoConfig = {
    async: true,
    cacheBust: 'v=7.0.7',
    packages: [
      {
        name: 'scripts',
        location: locationPath + '/scripts',
      },
    ],
  }
})()
