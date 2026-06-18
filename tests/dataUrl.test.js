const test = require('node:test')
const assert = require('node:assert')

let dataUrl

globalThis.define = function (dependencies, factory) {
  if (typeof dependencies === 'function') {
    factory = dependencies
  }
  dataUrl = factory()
}

require('../docs/scripts/dataUrl.js')

function withDocument(bodyAttrs, pathname, fn) {
  const prevBody = globalThis.document
  const prevLocation = globalThis.window

  globalThis.document = {
    body: {
      getAttribute(name) {
        return bodyAttrs[name] ?? null
      },
    },
  }
  globalThis.window = { location: { pathname } }

  try {
    fn()
  } finally {
    globalThis.document = prevBody
    globalThis.window = prevLocation
  }
}

test('resolveDataUrl keeps polygon files local in pruned PR previews', () => {
  withDocument({ 'data-database-pruned': 'true' }, '/nr-seedtransfer-map/deployments/pr-99/', () => {
    assert.strictEqual(
      dataUrl.resolveDataUrl('Version_7_0/Management_Units.fgb'),
      'Version_7_0/Management_Units.fgb',
    )
    assert.strictEqual(
      dataUrl.resolveDataUrl('Version_7_0/Suitable_BEC.fgb'),
      'Version_7_0/Suitable_BEC.fgb',
    )
    assert.strictEqual(
      dataUrl.resolveDataUrl('Version_7_0/bec_bounds.json'),
      'Version_7_0/bec_bounds.json',
    )
  })
})

test('resolveDataUrl falls back to production for pruned seedlot assets', () => {
  withDocument({ 'data-database-pruned': 'true' }, '/nr-seedtransfer-map/deployments/pr-99/', () => {
    assert.strictEqual(
      dataUrl.resolveDataUrl('Version_7_0/Orchard_list.json'),
      '../../Version_7_0/Orchard_list.json',
    )
    assert.strictEqual(
      dataUrl.resolveDataUrl('Version_7_0/Hw_Seedlots.fgb'),
      '../../Version_7_0/Hw_Seedlots.fgb',
    )
  })
})

test('resolveDataUrl leaves paths unchanged outside pruned PR previews', () => {
  withDocument({}, '/nr-seedtransfer-map/', () => {
    assert.strictEqual(
      dataUrl.resolveDataUrl('Version_7_0/Management_Units.fgb'),
      'Version_7_0/Management_Units.fgb',
    )
    assert.strictEqual(
      dataUrl.resolveDataUrl('Version_7_0/Orchard_list.json'),
      'Version_7_0/Orchard_list.json',
    )
  })
})
