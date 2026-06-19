// Intercept and silence expected Esri basemap/CDN tile loading errors
// (e.g. transient "Failed to load tile" on network blips)
// to keep the developer console 100% clean of expected warnings.
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

function isEsriTileError(args) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg) continue
    const str = String(arg)
    if (str.indexOf('Failed to load tile') !== -1 || str.indexOf('FeatureSourceEventLog') !== -1) {
      return true
    }
    if (typeof arg === 'object') {
      try {
        const json = JSON.stringify(arg)
        if (
          json.indexOf('Failed to load tile') !== -1 ||
          json.indexOf('FeatureSourceEventLog') !== -1
        ) {
          return true
        }
      } catch {
        if (
          arg.message &&
          (arg.message.indexOf('Failed to load tile') !== -1 ||
            arg.message.indexOf('FeatureSourceEventLog') !== -1)
        ) {
          return true
        }
      }
    }
  }
  return false
}

console.error = function (...args) {
  if (isEsriTileError(args)) return
  originalConsoleError.apply(console, args)
}

console.warn = function (...args) {
  if (isEsriTileError(args)) return
  originalConsoleWarn.apply(console, args)
}

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
    cacheBust: 'v=7.0.8',
    packages: [
      {
        name: 'scripts',
        location: locationPath + '/scripts',
      },
    ],
  }
})()
