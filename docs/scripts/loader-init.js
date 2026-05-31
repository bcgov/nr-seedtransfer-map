// Intercept and silence the expected internal Esri FeatureLayer load error for "Area of Use"
// to keep the developer console 100% clean of expected public deployment warnings.
const originalConsoleError = console.error
console.error = function (...args) {
  let hasFailedToLoad = false
  let hasAreaOfUse = false

  args.forEach(function (arg) {
    if (!arg) return
    const str = String(arg)
    if (str.indexOf('Failed to load layer') !== -1 || str.indexOf('FeatureLayer') !== -1) {
      hasFailedToLoad = true
    }
    if (str.indexOf('Area of Use') !== -1) {
      hasAreaOfUse = true
    }
    // Check object properties
    if (typeof arg === 'object') {
      try {
        const json = JSON.stringify(arg)
        if (json.indexOf('Area of Use') !== -1) {
          hasAreaOfUse = true
        }
        if (json.indexOf('Failed to load layer') !== -1) {
          hasFailedToLoad = true
        }
      } catch {
        // Circular object fallback: inspect common fields
        if (
          arg.title === 'Area of Use' ||
          arg.name === 'Area of Use' ||
          arg.message === 'Area of Use'
        ) {
          hasAreaOfUse = true
        }
        if (arg.message && arg.message.indexOf('Failed to load layer') !== -1) {
          hasFailedToLoad = true
        }
      }
    }
  })

  if (hasFailedToLoad && hasAreaOfUse) {
    return
  }
  originalConsoleError.apply(console, args)
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
    cacheBust: 'v=7.0.5',
    packages: [
      {
        name: 'scripts',
        location: locationPath + '/scripts',
      },
    ],
  }
})()
